#!/usr/bin/env python3
"""
Deployment script for production builds
Supports multiple deployment targets and environments
"""

import os
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

class DeploymentManager:
    def __init__(self, build_dir='dist'):
        self.build_dir = Path(build_dir)
        self.config = self.load_deploy_config()
        
    def load_deploy_config(self):
        """Load deployment configuration"""
        config_file = Path('deploy.config.json')
        default_config = {
            "environments": {
                "staging": {
                    "type": "static",
                    "path": "./staging",
                    "url": "https://staging.yourapp.com"
                },
                "production": {
                    "type": "static", 
                    "path": "./production",
                    "url": "https://yourapp.com"
                }
            },
            "backup": {
                "enabled": true,
                "keep_versions": 5
            },
            "health_check": {
                "enabled": true,
                "timeout": 30
            }
        }
        
        if config_file.exists():
            with open(config_file, 'r') as f:
                user_config = json.load(f)
                return {**default_config, **user_config}
        
        return default_config
    
    def validate_build(self):
        """Validate build directory and files"""
        print("🔍 Validating build...")
        
        if not self.build_dir.exists():
            raise Exception(f"Build directory {self.build_dir} does not exist")
        
        # Check required files
        required_files = ['index.html', 'build-manifest.json']
        for file in required_files:
            if not (self.build_dir / file).exists():
                raise Exception(f"Required file {file} not found in build")
        
        # Load and validate manifest
        with open(self.build_dir / 'build-manifest.json', 'r') as f:
            manifest = json.load(f)
        
        # Check bundle files exist
        for file_type, filename in manifest['files'].items():
            if not (self.build_dir / filename).exists():
                raise Exception(f"Bundle file {filename} not found")
        
        print("   ✓ Build validation passed")
        return manifest
    
    def backup_existing(self, target_path):
        """Backup existing deployment"""
        if not self.config['backup']['enabled']:
            return
        
        target = Path(target_path)
        if not target.exists():
            return
        
        print("📦 Creating backup...")
        
        # Create backup directory
        backup_dir = target.parent / 'backups'
        backup_dir.mkdir(exist_ok=True)
        
        # Create timestamped backup
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = backup_dir / f"backup_{timestamp}"
        
        # Copy existing deployment
        import shutil
        shutil.copytree(target, backup_path)
        
        print(f"   ✓ Backup created: {backup_path}")
        
        # Clean old backups
        self.cleanup_old_backups(backup_dir)
    
    def cleanup_old_backups(self, backup_dir):
        """Remove old backups beyond keep_versions limit"""
        keep_versions = self.config['backup']['keep_versions']
        
        backup_dirs = sorted([
            d for d in backup_dir.iterdir() 
            if d.is_dir() and d.name.startswith('backup_')
        ], key=lambda x: x.stat().st_mtime, reverse=True)
        
        if len(backup_dirs) > keep_versions:
            import shutil
            for old_backup in backup_dirs[keep_versions:]:
                shutil.rmtree(old_backup)
                print(f"   🗑️  Removed old backup: {old_backup.name}")
    
    def deploy_static(self, target_path, environment):
        """Deploy to static file directory"""
        print(f"📁 Deploying to static directory: {target_path}")
        
        target = Path(target_path)
        
        # Backup existing
        self.backup_existing(target)
        
        # Remove existing
        if target.exists():
            import shutil
            shutil.rmtree(target)
        
        # Copy new build
        import shutil
        shutil.copytree(self.build_dir, target)
        
        print(f"   ✓ Deployed to {target}")
        
        # Create deployment info
        deploy_info = {
            "deployed_at": datetime.now().isoformat(),
            "environment": environment,
            "build_manifest": str(self.build_dir / 'build-manifest.json')
        }
        
        with open(target / 'deploy-info.json', 'w') as f:
            json.dump(deploy_info, f, indent=2)
    
    def deploy_aws_s3(self, bucket, environment):
        """Deploy to AWS S3"""
        print(f"☁️  Deploying to AWS S3: {bucket}")
        
        try:
            # Check if AWS CLI is available
            subprocess.run(['aws', '--version'], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise Exception("AWS CLI not found. Please install and configure AWS CLI")
        
        # Sync files to S3
        sync_cmd = [
            'aws', 's3', 'sync', 
            str(self.build_dir), 
            f's3://{bucket}',
            '--delete'
        ]
        
        # Add cache headers for static assets
        cache_cmd = [
            'aws', 's3', 'cp',
            f's3://{bucket}',
            f's3://{bucket}',
            '--recursive',
            '--metadata-directive', 'REPLACE',
            '--cache-control', 'max-age=31536000',
            '--exclude', '*.html',
            '--exclude', '*.json'
        ]
        
        html_cache_cmd = [
            'aws', 's3', 'cp',
            f's3://{bucket}',
            f's3://{bucket}',
            '--recursive',
            '--metadata-directive', 'REPLACE',
            '--cache-control', 'max-age=0, no-cache',
            '--include', '*.html',
            '--include', '*.json'
        ]
        
        # Execute commands
        subprocess.run(sync_cmd, check=True)
        subprocess.run(cache_cmd, check=True)
        subprocess.run(html_cache_cmd, check=True)
        
        print(f"   ✅ Deployed to S3: s3://{bucket}")
    
    def deploy_netlify(self, site_id, environment):
        """Deploy to Netlify"""
        print(f"🌐 Deploying to Netlify: {site_id}")
        
        try:
            # Check if Netlify CLI is available
            subprocess.run(['netlify', '--version'], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise Exception("Netlify CLI not found. Please install: npm install -g netlify-cli")
        
        # Deploy to Netlify
        deploy_cmd = [
            'netlify', 'deploy',
            '--dir', str(self.build_dir),
            '--site', site_id
        ]
        
        if environment == 'production':
            deploy_cmd.append('--prod')
        
        subprocess.run(deploy_cmd, check=True)
        print(f"   ✅ Deployed to Netlify")
    
    def deploy_vercel(self, project_name, environment):
        """Deploy to Vercel"""
        print(f"▲ Deploying to Vercel: {project_name}")
        
        try:
            # Check if Vercel CLI is available
            subprocess.run(['vercel', '--version'], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise Exception("Vercel CLI not found. Please install: npm install -g vercel")
        
        # Deploy to Vercel
        deploy_cmd = ['vercel', str(self.build_dir)]
        
        if environment == 'production':
            deploy_cmd.append('--prod')
        
        subprocess.run(deploy_cmd, check=True)
        print(f"   ✅ Deployed to Vercel")
    
    def health_check(self, url):
        """Perform health check after deployment"""
        if not self.config['health_check']['enabled']:
            return True
        
        print(f"🏥 Performing health check: {url}")
        
        try:
            import requests
            response = requests.get(
                url, 
                timeout=self.config['health_check']['timeout']
            )
            
            if response.status_code == 200:
                print("   ✅ Health check passed")
                return True
            else:
                print(f"   ❌ Health check failed: {response.status_code}")
                return False
                
        except ImportError:
            print("   ⚠️  Requests library not available, skipping health check")
            return True
        except Exception as e:
            print(f"   ❌ Health check failed: {e}")
            return False
    
    def deploy(self, environment='staging'):
        """Main deployment function"""
        print(f"🚀 Starting deployment to {environment}...\n")
        
        # Validate build
        manifest = self.validate_build()
        
        # Get environment config
        env_config = self.config['environments'].get(environment)
        if not env_config:
            raise Exception(f"Environment {environment} not configured")
        
        try:
            # Deploy based on type
            deploy_type = env_config['type']
            
            if deploy_type == 'static':
                self.deploy_static(env_config['path'], environment)
            elif deploy_type == 's3':
                self.deploy_aws_s3(env_config['bucket'], environment)
            elif deploy_type == 'netlify':
                self.deploy_netlify(env_config['site_id'], environment)
            elif deploy_type == 'vercel':
                self.deploy_vercel(env_config['project'], environment)
            else:
                raise Exception(f"Unknown deployment type: {deploy_type}")
            
            # Health check
            if 'url' in env_config:
                self.health_check(env_config['url'])
            
            print(f"\n✅ Deployment to {environment} completed successfully!")
            
            if 'url' in env_config:
                print(f"🌐 Application URL: {env_config['url']}")
            
        except Exception as e:
            print(f"\n❌ Deployment failed: {e}")
            raise

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Deploy application to various environments')
    parser.add_argument('environment', nargs='?', default='staging',
                       help='Deployment environment (staging, production)')
    parser.add_argument('--build-dir', default='dist',
                       help='Build directory to deploy')
    parser.add_argument('--config', help='Deployment configuration file')
    
    args = parser.parse_args()
    
    deployer = DeploymentManager(args.build_dir)
    deployer.deploy(args.environment)

if __name__ == '__main__':
    main()