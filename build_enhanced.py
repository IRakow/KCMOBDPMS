#!/usr/bin/env python3
"""
Enhanced Production Build System
Optimizes and bundles the application for production deployment
"""

import os
import re
import json
import gzip
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

class ProductionBuilder:
    def __init__(self, src_dir='src', dist_dir='dist'):
        self.src_dir = Path(src_dir)
        self.dist_dir = Path(dist_dir)
        self.config = self.load_build_config()
        self.stats = {
            'files_processed': 0,
            'original_size': 0,
            'minified_size': 0,
            'gzipped_size': 0,
            'build_time': 0
        }

    def load_build_config(self) -> Dict:
        """Load build configuration"""
        config_file = Path('build.config.json')
        default_config = {
            'minify': True,
            'gzip': True,
            'source_maps': False,
            'bundle_splitting': True,
            'css_optimization': True,
            'image_optimization': False,
            'hash_filenames': True,
            'remove_dev_code': True,
            'compression_level': 9
        }
        
        if config_file.exists():
            with open(config_file, 'r') as f:
                user_config = json.load(f)
                return {**default_config, **user_config}
        
        return default_config

    def minify_jsx(self, content: str) -> str:
        """Advanced JSX minification"""
        original_size = len(content)
        
        # Remove comments (more comprehensive)
        content = re.sub(r'//.*?(?=\n|$)', '', content)
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # Remove dev-only code if configured
        if self.config['remove_dev_code']:
            # Remove console.log statements
            content = re.sub(r'console\.(log|debug|info)\([^)]*\);?', '', content)
            
            # Remove dev-only blocks
            content = re.sub(
                r'if\s*\(\s*(?:window\.)?(?:location\.hostname\s*===\s*[\'"]localhost[\'"]|process\.env\.NODE_ENV\s*!==\s*[\'"]production[\'"])\s*\)\s*\{[^}]*\}',
                '', content, flags=re.DOTALL
            )
        
        # Optimize whitespace
        content = re.sub(r'\s+', ' ', content)
        content = re.sub(r'>\s+<', '><', content)
        content = re.sub(r'\s*([{}();,:])\s*', r'\1', content)
        content = re.sub(r';\s*}', '}', content)
        
        # Remove trailing semicolons before }
        content = re.sub(r';\s*}', '}', content)
        
        # Optimize React patterns
        content = re.sub(r'React\.createElement\s*\(', 'React.createElement(', content)
        content = re.sub(r'React\.useState\s*\(', 'React.useState(', content)
        content = re.sub(r'React\.useEffect\s*\(', 'React.useEffect(', content)
        
        minified_size = len(content)
        compression_ratio = ((original_size - minified_size) / original_size) * 100
        
        print(f"   Minified: {original_size} → {minified_size} bytes ({compression_ratio:.1f}% reduction)")
        
        return content.strip()

    def minify_css(self, content: str) -> str:
        """CSS minification"""
        original_size = len(content)
        
        # Remove comments
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # Remove whitespace
        content = re.sub(r'\s+', ' ', content)
        content = re.sub(r';\s*}', '}', content)
        content = re.sub(r'{\s*', '{', content)
        content = re.sub(r'}\s*', '}', content)
        content = re.sub(r':\s*', ':', content)
        content = re.sub(r';\s*', ';', content)
        
        # Remove last semicolon before }
        content = re.sub(r';+}', '}', content)
        
        minified_size = len(content)
        compression_ratio = ((original_size - minified_size) / original_size) * 100
        
        print(f"   CSS Minified: {original_size} → {minified_size} bytes ({compression_ratio:.1f}% reduction)")
        
        return content.strip()

    def optimize_javascript(self, content: str) -> str:
        """Advanced JavaScript optimizations"""
        # Replace common patterns with shorter equivalents
        optimizations = [
            (r'document\.getElementById\(', 'document.getElementById('),
            (r'document\.querySelector\(', 'document.querySelector('),
            (r'console\.log\([^)]*\);?', ''),  # Remove console.log
            (r'console\.debug\([^)]*\);?', ''),  # Remove console.debug
        ]
        
        for pattern, replacement in optimizations:
            content = re.sub(pattern, replacement, content)
        
        return content

    def create_file_hash(self, content: str) -> str:
        """Create hash for filename versioning"""
        return hashlib.md5(content.encode()).hexdigest()[:8]

    def compress_gzip(self, content: str) -> bytes:
        """Gzip compression"""
        return gzip.compress(content.encode(), compresslevel=self.config['compression_level'])

    def bundle_modules(self) -> Tuple[str, Dict[str, str]]:
        """Bundle all modules with dependency resolution"""
        print("📦 Bundling modules...")
        
        bundles = {
            'core': [],      # Core utilities and libraries
            'components': [], # React components
            'pages': [],     # Page components
            'widgets': []    # Widget components
        }
        
        file_map = {}
        
        # Process files by category
        for jsx_file in self.src_dir.rglob('*.jsx'):
            with open(jsx_file, 'r', encoding='utf-8') as f:
                content = f.read()
                self.stats['original_size'] += len(content)
                
                if self.config['minify']:
                    content = self.minify_jsx(content)
                    content = self.optimize_javascript(content)
                
                self.stats['minified_size'] += len(content)
                self.stats['files_processed'] += 1
                
                # Categorize files
                relative_path = jsx_file.relative_to(self.src_dir)
                
                if 'pages' in str(relative_path):
                    bundles['pages'].append(f'// {jsx_file.name}\n{content}')
                    category = 'pages'
                elif 'widgets' in str(relative_path):
                    bundles['widgets'].append(f'// {jsx_file.name}\n{content}')
                    category = 'widgets'
                elif 'components' in str(relative_path):
                    bundles['components'].append(f'// {jsx_file.name}\n{content}')
                    category = 'components'
                else:
                    bundles['core'].append(f'// {jsx_file.name}\n{content}')
                    category = 'core'
                
                file_map[str(jsx_file)] = category
                print(f"   ✓ {jsx_file.name} → {category}")
        
        # Combine bundles
        combined_content = []
        
        # Core modules first (utilities, state management, etc.)
        if bundles['core']:
            combined_content.extend(bundles['core'])
        
        # Components next
        if bundles['components']:
            combined_content.extend(bundles['components'])
        
        # Widgets
        if bundles['widgets']:
            combined_content.extend(bundles['widgets'])
        
        # Pages last
        if bundles['pages']:
            combined_content.extend(bundles['pages'])
        
        return '\n\n'.join(combined_content), file_map

    def process_css(self) -> str:
        """Process and minify CSS files"""
        print("🎨 Processing CSS...")
        
        css_content = []
        
        for css_file in self.src_dir.rglob('*.css'):
            with open(css_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                if self.config['css_optimization']:
                    content = self.minify_css(content)
                
                css_content.append(f'/* {css_file.name} */\n{content}')
                print(f"   ✓ {css_file.name}")
        
        return '\n\n'.join(css_content)

    def process_static_files(self):
        """Copy and optimize static files"""
        print("📁 Processing static files...")
        
        static_files = ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg', '*.ico', '*.json']
        
        for pattern in static_files:
            for file_path in self.src_dir.rglob(pattern):
                relative_path = file_path.relative_to(self.src_dir)
                dest_path = self.dist_dir / relative_path
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Simple copy for now (could add image optimization)
                with open(file_path, 'rb') as src, open(dest_path, 'wb') as dst:
                    dst.write(src.read())
                
                print(f"   ✓ {file_path.name}")

    def create_production_html(self, js_hash: str, css_hash: str) -> str:
        """Create optimized production HTML"""
        html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Management System</title>
    
    <!-- Preload critical resources -->
    <link rel="preload" href="https://unpkg.com/react@18/umd/react.production.min.js" as="script">
    <link rel="preload" href="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" as="script">
    
    <!-- Optimized styles -->
    <link rel="stylesheet" href="app.{css_hash}.min.css">
    
    <!-- Preconnect to CDNs -->
    <link rel="preconnect" href="https://unpkg.com">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    
    <!-- Performance optimizations -->
    <meta name="theme-color" content="#000000">
    <meta name="mobile-web-app-capable" content="yes">
</head>
<body>
    <div id="root">
        <!-- Loading state -->
        <div class="app-loading">
            <div class="spinner"></div>
            <p>Loading Property Management System...</p>
        </div>
    </div>
    
    <!-- Core libraries -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Application bundle -->
    <script src="app.{js_hash}.min.js"></script>
</body>
</html>'''
        return html_template

    def create_build_manifest(self, js_hash: str, css_hash: str, file_map: Dict[str, str]) -> Dict:
        """Create build manifest for deployment"""
        return {
            'build_time': datetime.now().isoformat(),
            'version': js_hash,
            'files': {
                'js': f'app.{js_hash}.min.js',
                'css': f'app.{css_hash}.min.css',
                'html': 'index.html'
            },
            'file_map': file_map,
            'stats': self.stats,
            'config': self.config
        }

    def build(self):
        """Main build process"""
        start_time = datetime.now()
        print("🚀 Starting production build...\n")
        
        # Clean dist directory
        if self.dist_dir.exists():
            import shutil
            shutil.rmtree(self.dist_dir)
        self.dist_dir.mkdir(exist_ok=True)
        
        try:
            # Bundle JavaScript
            js_content, file_map = self.bundle_modules()
            
            # Process CSS
            css_content = self.process_css()
            
            # Create file hashes
            js_hash = self.create_file_hash(js_content) if self.config['hash_filenames'] else 'latest'
            css_hash = self.create_file_hash(css_content) if self.config['hash_filenames'] else 'latest'
            
            # Write JavaScript bundle
            js_filename = f'app.{js_hash}.min.js'
            with open(self.dist_dir / js_filename, 'w', encoding='utf-8') as f:
                f.write(js_content)
            
            # Write CSS bundle
            css_filename = f'app.{css_hash}.min.css'
            with open(self.dist_dir / css_filename, 'w', encoding='utf-8') as f:
                f.write(css_content)
            
            # Create gzipped versions
            if self.config['gzip']:
                print("\n🗜️  Creating gzipped versions...")
                
                js_gzipped = self.compress_gzip(js_content)
                with open(self.dist_dir / f'{js_filename}.gz', 'wb') as f:
                    f.write(js_gzipped)
                
                css_gzipped = self.compress_gzip(css_content)
                with open(self.dist_dir / f'{css_filename}.gz', 'wb') as f:
                    f.write(css_gzipped)
                
                self.stats['gzipped_size'] = len(js_gzipped) + len(css_gzipped)
                print(f"   ✓ JS: {len(js_gzipped)} bytes")
                print(f"   ✓ CSS: {len(css_gzipped)} bytes")
            
            # Create production HTML
            html_content = self.create_production_html(js_hash, css_hash)
            with open(self.dist_dir / 'index.html', 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            # Process static files
            self.process_static_files()
            
            # Create build manifest
            manifest = self.create_build_manifest(js_hash, css_hash, file_map)
            with open(self.dist_dir / 'build-manifest.json', 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2)
            
            # Calculate build time
            build_time = datetime.now() - start_time
            self.stats['build_time'] = build_time.total_seconds()
            
            # Print build summary
            self.print_build_summary(js_hash, css_hash)
            
        except Exception as e:
            print(f"❌ Build failed: {e}")
            raise

    def print_build_summary(self, js_hash: str, css_hash: str):
        """Print build summary"""
        print(f"\n✅ Build completed successfully!")
        print(f"📊 Build Statistics:")
        print(f"   Files processed: {self.stats['files_processed']}")
        print(f"   Original size: {self.stats['original_size']:,} bytes")
        print(f"   Minified size: {self.stats['minified_size']:,} bytes")
        
        if self.stats['gzipped_size']:
            print(f"   Gzipped size: {self.stats['gzipped_size']:,} bytes")
        
        reduction = ((self.stats['original_size'] - self.stats['minified_size']) / self.stats['original_size']) * 100
        print(f"   Size reduction: {reduction:.1f}%")
        print(f"   Build time: {self.stats['build_time']:.2f}s")
        
        print(f"\n📦 Output files:")
        print(f"   app.{js_hash}.min.js")
        print(f"   app.{css_hash}.min.css")
        print(f"   index.html")
        print(f"   build-manifest.json")
        
        if self.config['gzip']:
            print(f"   *.gz (gzipped versions)")
        
        print(f"\n🚀 Ready for deployment in {self.dist_dir}/")

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Build production version of the app')
    parser.add_argument('--src', default='src', help='Source directory')
    parser.add_argument('--dist', default='dist', help='Distribution directory')
    parser.add_argument('--config', help='Build configuration file')
    
    args = parser.parse_args()
    
    builder = ProductionBuilder(args.src, args.dist)
    builder.build()

if __name__ == '__main__':
    main()