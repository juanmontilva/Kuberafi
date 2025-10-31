import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const heroRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animación del logo y nav
            gsap.fromTo('.nav-logo',
                {
                    opacity: 0,
                    scale: 0.8
                },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'back.out(1.7)'
                }
            );

            gsap.fromTo('.nav-item',
                {
                    opacity: 0,
                    y: -20
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    delay: 0.3,
                    ease: 'power3.out'
                }
            );

            // Hero - Animación de título más elegante
            gsap.fromTo('.hero-title',
                {
                    opacity: 0,
                    y: 80
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power4.out',
                    delay: 0.2
                }
            );

            gsap.fromTo('.hero-gradient-text',
                {
                    opacity: 0,
                    y: 60
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    delay: 0.5
                }
            );

            gsap.fromTo('.hero-subtitle',
                {
                    opacity: 0,
                    y: 40
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    delay: 0.8,
                    ease: 'power3.out'
                }
            );

            gsap.fromTo('.hero-cta',
                {
                    opacity: 0,
                    y: 30,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    delay: 1.1,
                    stagger: 0.15,
                    ease: 'back.out(1.5)'
                }
            );

            // Grid animado de fondo
            gsap.to('.grid-line', {
                opacity: 0.15,
                duration: 3,
                stagger: {
                    each: 0.08,
                    from: 'random',
                    repeat: -1,
                    yoyo: true
                },
                ease: 'sine.inOut'
            });

            // Partículas flotantes más suaves
            gsap.to('.particle', {
                y: 'random(-150, 150)',
                x: 'random(-150, 150)',
                scale: 'random(0.5, 1.5)',
                duration: 'random(4, 8)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: {
                    each: 0.3,
                    from: 'random'
                }
            });

            // Orbes de luz con movimiento más orgánico
            gsap.to('.glow-orb-1', {
                x: 100,
                y: -100,
                scale: 1.3,
                opacity: 0.08,
                duration: 8,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            gsap.to('.glow-orb-2', {
                x: -80,
                y: 120,
                scale: 1.2,
                opacity: 0.06,
                duration: 10,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            // Stats con animación de contador
            gsap.fromTo('.stat-card',
                {
                    opacity: 0,
                    y: 50
                },
                {
                    scrollTrigger: {
                        trigger: '.stats-section',
                        start: 'top 80%',
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.12,
                    duration: 0.8,
                    ease: 'power3.out'
                }
            );

            // Feature cards con efecto 3D
            gsap.fromTo('.feature-card',
                {
                    opacity: 0,
                    y: 80,
                    rotationX: -20
                },
                {
                    scrollTrigger: {
                        trigger: '.features-grid',
                        start: 'top 75%',
                    },
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    transformPerspective: 1000,
                    stagger: 0.15,
                    duration: 1.2,
                    ease: 'power4.out'
                }
            );

            // Parallax suave
            gsap.to('.parallax-slow', {
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 2
                },
                y: 250,
                ease: 'none'
            });

            gsap.to('.parallax-fast', {
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                },
                y: -150,
                ease: 'none'
            });

            // CTA section
            gsap.fromTo('.cta-content',
                {
                    opacity: 0,
                    y: 60
                },
                {
                    scrollTrigger: {
                        trigger: '.cta-section',
                        start: 'top 70%',
                    },
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out'
                }
            );

        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <>
            <Head title="Kuberafi - Plataforma Financiera">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700,800,900" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative" ref={heroRef}>
                {/* Grid de fondo premium - Estilo OKX */}
                <div className="fixed inset-0 opacity-[0.04]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px'
                    }}>
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="grid-line absolute h-full w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0"
                                style={{ left: `${(i + 1) * 5}%` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Partículas elegantes */}
                <div className="fixed inset-0 pointer-events-none">
                    {[...Array(25)].map((_, i) => (
                        <div
                            key={i}
                            className="particle absolute w-[3px] h-[3px] rounded-full opacity-30"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: `radial-gradient(circle, rgba(255,255,255,${0.6 + Math.random() * 0.4}) 0%, transparent 70%)`
                            }}
                        />
                    ))}
                </div>

                {/* Orbes de luz premium con gradientes */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="glow-orb-1 parallax-slow absolute -top-40 -right-40 w-[900px] h-[900px] rounded-full opacity-[0.04]"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
                    <div className="glow-orb-2 parallax-fast absolute -bottom-40 -left-40 w-[800px] h-[800px] rounded-full opacity-[0.03]"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.02]"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />
                </div>

                {/* Navigation Premium - Estilo OKX */}
                <nav className="relative z-50 border-b border-white/[0.06] backdrop-blur-2xl bg-[#0a0a0a]/90">
                    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
                        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
                            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 nav-logo">
                                <div className="relative group cursor-pointer">
                                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center shadow-2xl shadow-white/10">
                                        <span className="text-lg sm:text-xl lg:text-2xl font-black text-black">K</span>
                                    </div>
                                </div>
                                <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    Kuberafi
                                </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="nav-item group relative px-4 sm:px-6 lg:px-10 py-2 sm:py-2.5 lg:py-3.5 bg-white text-black rounded-lg text-xs sm:text-sm lg:text-base font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/20"
                                    >
                                        <span className="relative z-10">Dashboard</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="nav-item px-3 sm:px-5 lg:px-8 py-2 sm:py-2.5 lg:py-3.5 text-gray-400 hover:text-white transition-all duration-300 text-xs sm:text-sm lg:text-base font-semibold relative group"
                                        >
                                            <span className="hidden sm:inline">Iniciar Sesión</span>
                                            <span className="sm:hidden">Iniciar</span>
                                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white group-hover:w-full transition-all duration-300" />
                                        </Link>
                                        <div className="nav-item group relative px-3 sm:px-6 lg:px-10 py-2 sm:py-2.5 lg:py-3.5 bg-white/5 border border-white/20 text-white rounded-lg text-xs sm:text-sm lg:text-base font-semibold overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/30 cursor-not-allowed">
                                            <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <span className="hidden lg:inline">Ingreso solo por invitación</span>
                                                <span className="hidden sm:inline lg:hidden">Por invitación</span>
                                                <span className="sm:hidden">Invitación</span>
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Premium - Estilo OKX Majestuoso */}
                <section className="relative z-10 pt-20 sm:pt-32 md:pt-40 lg:pt-48 pb-20 sm:pb-28 md:pb-32 lg:pb-40 px-4 sm:px-6 md:px-8">
                    <div className="max-w-[1440px] mx-auto">
                        <div className="text-center max-w-7xl mx-auto">
                            {/* Badge Premium */}
                            <div className="hero-subtitle inline-flex items-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-xl mb-8 sm:mb-10 md:mb-12">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs sm:text-sm font-medium text-gray-400">Plataforma Financiera Institucional</span>
                            </div>

                            {/* Título Principal */}
                            <div className="mb-6 sm:mb-8 overflow-hidden">
                                <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[9rem] font-black leading-[0.95] tracking-tighter mb-4 sm:mb-6">
                                    <span className="block text-white">Optimiza tus</span>
                                    <span className="hero-gradient-text block bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                                        operaciones
                                    </span>
                                    <span className="block text-gray-600 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl mt-3 sm:mt-4">
                                        de cambio de divisas
                                    </span>
                                </h1>
                            </div>

                            <p className="hero-subtitle text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-10 sm:mb-12 md:mb-16 max-w-3xl mx-auto font-light leading-relaxed px-4">
                                Gestión inteligente, control total y máxima eficiencia para casas de cambio profesionales
                            </p>

                            {/* CTAs Premium */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 px-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="hero-cta group relative w-full sm:w-auto px-8 sm:px-10 md:px-12 lg:px-14 py-3.5 sm:py-4 md:py-5 bg-white text-black rounded-xl font-bold text-sm sm:text-base md:text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/30 hover:scale-105"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                                            Ir al Dashboard
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="hero-cta group relative w-full sm:w-auto px-8 sm:px-10 md:px-12 lg:px-14 py-3.5 sm:py-4 md:py-5 bg-white text-black rounded-xl font-bold text-sm sm:text-base md:text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/30 hover:scale-105"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                                                Comenzar Ahora
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </Link>
                                        <button className="hero-cta group w-full sm:w-auto px-8 sm:px-10 md:px-12 lg:px-14 py-3.5 sm:py-4 md:py-5 bg-transparent border-2 border-white/20 rounded-xl font-bold text-sm sm:text-base md:text-lg hover:bg-white/[0.05] hover:border-white/40 transition-all duration-300 hover:scale-105">
                                            <span className="flex items-center justify-center gap-2 sm:gap-3">
                                                Ver Demo
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Trust Indicators */}
                            <div className="hero-subtitle mt-12 sm:mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-500 px-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="whitespace-nowrap">ISO 27001</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="whitespace-nowrap">PCI DSS</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="whitespace-nowrap">AES-256</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Premium - Estilo OKX */}
                <section className="stats-section relative z-10 py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 border-y border-white/[0.06]">
                    <div className="max-w-[1440px] mx-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
                            {[
                                { value: '99.9%', label: 'Uptime Garantizado', icon: '⚡' },
                                { value: '24/7', label: 'Soporte Técnico', icon: '🛡️' },
                                { value: '<100ms', label: 'Procesamiento', icon: '🚀' },
                                { value: '100%', label: 'Cumplimiento', icon: '✓' }
                            ].map((stat, i) => (
                                <div key={i} className="stat-card relative group bg-[#0a0a0a]">
                                    <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 hover:bg-white/[0.02] transition-all duration-500">
                                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-xl sm:text-2xl md:text-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                                            {stat.icon}
                                        </div>
                                        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-2 sm:mb-3 md:mb-4 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
                                            {stat.value}
                                        </div>
                                        <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-wider sm:tracking-widest">
                                            {stat.label}
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Premium - Estilo OKX */}
                <section className="relative z-10 py-40 px-8" ref={featuresRef}>
                    <div className="max-w-[1440px] mx-auto">
                        {/* Header */}
                        <div className="text-center mb-32">
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-xl mb-8">
                                <span className="text-sm font-medium text-gray-400">Características</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
                                Tecnología Institucional
                            </h2>
                            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                                Herramientas profesionales diseñadas para optimizar cada aspecto de tu operación
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
                            {[
                                {
                                    icon: '💱',
                                    title: 'Gestión de Cambios',
                                    description: 'Control total de operaciones de compra y venta de divisas con cálculos automáticos y precisión institucional',
                                    gradient: 'from-blue-500/10 to-transparent'
                                },
                                {
                                    icon: '🛡️',
                                    title: 'Seguridad Bancaria',
                                    description: 'Cumplimiento normativo, auditoría completa y encriptación de nivel financiero para máxima protección',
                                    gradient: 'from-green-500/10 to-transparent'
                                },
                                {
                                    icon: '⚡',
                                    title: 'Procesamiento Rápido',
                                    description: 'Registra y procesa operaciones en milisegundos con tecnología optimizada de última generación',
                                    gradient: 'from-yellow-500/10 to-transparent'
                                },
                                {
                                    icon: '📊',
                                    title: 'Reportes Financieros',
                                    description: 'Análisis detallado de comisiones, márgenes y rentabilidad en tiempo real con visualizaciones avanzadas',
                                    gradient: 'from-purple-500/10 to-transparent'
                                },
                                {
                                    icon: '💰',
                                    title: 'Control de Comisiones',
                                    description: 'Gestión automática de pagos y cronogramas de comisiones por casa de cambio con total transparencia',
                                    gradient: 'from-pink-500/10 to-transparent'
                                },
                                {
                                    icon: '📱',
                                    title: 'Acceso Multiplataforma',
                                    description: 'Interfaz responsive optimizada para escritorio, tablet y móvil con experiencia fluida en todos los dispositivos',
                                    gradient: 'from-cyan-500/10 to-transparent'
                                }
                            ].map((feature, i) => (
                                <div key={i} className="feature-card group relative bg-[#0a0a0a] overflow-hidden">
                                    {/* Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                    <div className="relative h-full p-12 hover:bg-white/[0.02] transition-all duration-500">
                                        {/* Icon */}
                                        <div className="text-5xl mb-8 transform group-hover:scale-110 transition-transform duration-500">
                                            {feature.icon}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-white transition-colors duration-300">
                                            {feature.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-500 group-hover:text-gray-400 leading-relaxed text-base transition-colors duration-300">
                                            {feature.description}
                                        </p>

                                        {/* Hover Border */}
                                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Premium - Estilo OKX */}
                <section className="cta-section relative z-10 py-40 px-8">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="cta-content relative group">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative p-20 md:p-28 border border-white/[0.08] rounded-3xl hover:border-white/[0.15] transition-all duration-700 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-xl overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl" />

                                <div className="relative text-center">
                                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight">
                                        <span className="block bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                                            Transforma tu
                                        </span>
                                        <span className="block text-white mt-2">
                                            operación hoy
                                        </span>
                                    </h2>
                                    <p className="text-xl md:text-2xl text-gray-400 mb-14 font-light max-w-3xl mx-auto leading-relaxed">
                                        Únete a las casas de cambio que optimizan sus procesos y maximizan su rentabilidad con Kuberafi
                                    </p>
                                    {!auth.user && (
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                                            <Link
                                                href={login()}
                                                className="group relative px-14 py-5 bg-white text-black rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/30 hover:scale-105"
                                            >
                                                <span className="relative z-10 flex items-center gap-3">
                                                    Comenzar Ahora
                                                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </Link>
                                            <button className="px-14 py-5 text-gray-400 hover:text-white transition-colors duration-300 font-semibold text-lg">
                                                Hablar con Ventas →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Premium - Estilo OKX */}
                <footer className="relative z-10 border-t border-white/[0.06] py-20 px-8">
                    <div className="max-w-[1440px] mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                            {/* Logo */}
                            <div className="flex items-center gap-4">
                                <div className="relative group cursor-pointer">
                                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                    <div className="relative w-12 h-12 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center shadow-2xl shadow-white/10">
                                        <span className="text-2xl font-black text-black">K</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-2xl font-black block bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                        Kuberafi
                                    </span>
                                    <span className="text-xs text-gray-600 font-medium">Financial Platform</span>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                                <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300 font-medium">Características</a>
                                <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300 font-medium">Precios</a>
                                <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300 font-medium">Documentación</a>
                                <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300 font-medium">Soporte</a>
                                <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300 font-medium">Contacto</a>
                            </div>
                        </div>

                        {/* Bottom */}
                        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-gray-600 text-sm font-normal">
                                © 2024 Kuberafi. Plataforma Financiera Institucional. Todos los derechos reservados.
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors duration-300">Privacidad</a>
                                <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors duration-300">Términos</a>
                                <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors duration-300">Legal</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
