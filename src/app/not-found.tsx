'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    const handleGoBack = () => {
        // Check if user is logged in (you can replace this with actual auth check)
        const isLoggedIn = false; // TODO: Replace with actual auth check

        if (isLoggedIn) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />

            <div style={{
                margin: 0,
                padding: 0,
                backgroundColor: '#f5f4e8',
                color: '#2d2d2d',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <div style={{
                    maxWidth: '600px',
                    padding: '2rem',
                    animation: 'fadeIn 0.8s ease-out'
                }}>
                    <h1 style={{
                        fontSize: '8rem',
                        lineHeight: 1,
                        fontWeight: 'bold',
                        color: '#ffd700',
                        textShadow: '4px 4px 0px #000',
                        margin: 0
                    }}>404</h1>

                    <div style={{
                        margin: '2rem auto',
                        width: '200px',
                        height: '200px',
                        imageRendering: 'pixelated'
                    }}>
                        <svg style={{
                            width: '100%',
                            height: '100%',
                            animation: 'confuse 3s infinite ease-in-out'
                        }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 10 L65 40 L95 40 L70 60 L80 90 L50 75 L20 90 L30 60 L5 40 L35 40 Z" fill="#ff9999" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M25 85 L30 60 L70 60 L75 85 L50 75 Z" fill="#aaffaa" stroke="#000" strokeWidth="2" />
                            <path d="M30 65 L40 65 M50 65 L60 65" stroke="#880088" strokeWidth="2" />
                            <circle cx="42" cy="35" r="6" fill="white" stroke="#000" strokeWidth="1.5" />
                            <circle cx="58" cy="35" r="6" fill="white" stroke="#000" strokeWidth="1.5" />
                            <circle cx="42" cy="35" r="1.5" fill="black" />
                            <circle cx="58" cy="35" r="1.5" fill="black" />
                            <ellipse cx="50" cy="50" rx="3" ry="5" fill="black" />
                            <path d="M35 25 L45 22 M55 22 L65 25" stroke="#000" strokeWidth="1.5" fill="none" />
                            <path d="M70 25 Q75 30 70 35 Q65 30 70 25" fill="#aaddff" stroke="#000" strokeWidth="1" />
                        </svg>
                    </div>

                    <div style={{
                        fontSize: '2rem',
                        marginTop: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        fontFamily: "'VT323', monospace"
                    }}>
                        Ayo?? Where did it go??
                    </div>

                    <div style={{
                        fontSize: '1.5rem',
                        margin: '1.5rem 0 2.5rem 0',
                        lineHeight: 1.4,
                        color: '#555',
                        borderLeft: '4px solid #ffd700',
                        paddingLeft: '1rem',
                        display: 'inline-block',
                        textAlign: 'left',
                        fontFamily: "'VT323', monospace"
                    }}>
                        This page dipped faster than your crush when you said &quot;we need to talk.&quot;
                    </div>

                    <button
                        onClick={handleGoBack}
                        style={{
                            backgroundColor: '#2d2d2d',
                            color: '#fff',
                            border: 'none',
                            padding: '1rem 2rem',
                            fontSize: '1.5rem',
                            fontFamily: "'VT323', monospace",
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            boxShadow: '4px 4px 0px #ffd700',
                            transition: 'transform 0.1s, box-shadow 0.1s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translate(-2px, -2px)';
                            e.currentTarget.style.boxShadow = '6px 6px 0px #ffd700';
                            e.currentTarget.style.backgroundColor = '#000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translate(0, 0)';
                            e.currentTarget.style.boxShadow = '4px 4px 0px #ffd700';
                            e.currentTarget.style.backgroundColor = '#2d2d2d';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translate(2px, 2px)';
                            e.currentTarget.style.boxShadow = '0px 0px 0px #ffd700';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translate(-2px, -2px)';
                            e.currentTarget.style.boxShadow = '6px 6px 0px #ffd700';
                        }}
                    >
                        Take me back
                    </button>

                    <div style={{
                        marginTop: '3rem',
                        fontSize: '1rem',
                        fontFamily: "'VT323', monospace",
                        color: '#a89968'
                    }}>
                        © 2025 Mayank Bhatgare. Your data is safe... probably.
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes confuse {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(-5deg) scale(1.05); }
                    50% { transform: rotate(5deg) scale(1); }
                    75% { transform: rotate(-5deg) scale(1.05); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 600px) {
                    h1 { font-size: 6rem !important; }
                }
            `}</style>
        </>
    );
}
