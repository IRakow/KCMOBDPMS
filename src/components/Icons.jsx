const Icons = {
    Dashboard: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
    ),
    
    Building: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 16H15V6L9 2L3 6V16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M7 16V11H11V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 6H7.01M11 6H11.01M7 9H7.01M11 9H11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    ),
    
    Users: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 16C2 13.2386 4.23858 11 7 11C9.76142 11 12 13.2386 12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="13" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M16 16C16 14.3431 14.6569 13 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    
    Chart: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 16L6 10L10 12L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="16" cy="4" r="2" fill="currentColor"/>
            <rect x="2" y="13" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3"/>
            <rect x="8" y="10" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.3"/>
        </svg>
    ),
    
    Document: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 2H11L15 6V16H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M11 2V6H15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M7 9H12M7 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    
    Dollar: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 5V13M12 7C12 6 11 5 9 5C7 5 6 6 6 7C6 9 12 9 12 11C12 12 11 13 9 13C7 13 6 12 6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    
    Shield: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L3 5V9C3 13 6 15.5 9 16C12 15.5 15 13 15 9V5L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M7 9L8.5 10.5L11 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    
    Search: () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    
    Bell: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 2C7 2 7 1 9 1C11 1 11 2 11 2C13 3 14 5 14 7V11L15 13H3L4 11V7C4 5 5 3 7 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M7 15C7 16.1046 7.89543 17 9 17C10.1046 17 11 16.1046 11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    
    ChevronDown: () => (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    
    Plus: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    
    Filter: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3H14L10 8V13L6 11V8L2 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
    ),
    
    Download: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12V14H14V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),

    Megaphone: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 7V11H6L11 14V4L6 7H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M14 6C14.5 6.5 15 7.5 15 9C15 10.5 14.5 11.5 14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),

    Settings: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 1V3M9 15V17M17 9H15M3 9H1M15.07 2.93L13.66 4.34M4.34 13.66L2.93 15.07M15.07 15.07L13.66 13.66M4.34 4.34L2.93 2.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),

    Wrench: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14.5 4.5C14.5 6.5 13 8 11 8L8 11L4 15L2 13L6 9L9 6C9 4 10.5 2.5 12.5 2.5C13 2.5 13.5 2.6 14 2.8L11.5 5.3L12.7 6.5L15.2 4C15.4 4.5 15.5 5 15.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),

    People: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="5" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="13" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 15C2 13 3.5 11 5 11C6.5 11 8 13 8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 15C10 13 11.5 11 13 11C14.5 11 16 13 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),

    Command: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4V12H4V4H12Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 4V2C4 1.44772 3.55228 1 3 1C2.44772 1 2 1.44772 2 2V4C2 4.55228 2.44772 5 3 5H4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 4V2C12 1.44772 12.4477 1 13 1C13.5523 1 14 1.44772 14 2V4C14 4.55228 13.5523 5 13 5H12" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 12V14C4 14.5523 3.55228 15 3 15C2.44772 15 2 14.5523 2 14V12C2 11.4477 2.44772 11 3 11H4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 12V14C12 14.5523 12.4477 15 13 15C13.5523 15 14 14.5523 14 14V12C14 11.4477 13.5523 11 13 11H12" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
    ),
    
    Edit: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 2.5L13.5 4.5L11.5 2.5ZM12.5 1.5L8 6L6 10L10 8L14.5 3.5C14.7761 3.22386 14.7761 2.77614 14.5 2.5L13.5 1.5C13.2239 1.22386 12.7761 1.22386 12.5 1.5V1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 10V14H2V2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    
    Grid: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="4" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        </svg>
    )
};