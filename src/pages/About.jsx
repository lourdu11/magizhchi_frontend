import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <div className="container-custom py-16 max-w-4xl mx-auto">
      <Helmet>
        <title>About Us — Magizhchi Garments</title>
        <meta name="description" content="Learn the story behind Magizhchi Garments — quality menswear crafted with passion since 2010." />
      </Helmet>

      {/* Hero */}
      <div className="text-center mb-16">
        <span className="text-xs font-bold tracking-widest text-premium-gold uppercase">Our Story</span>
        <h1 className="text-4xl font-bold text-text-primary mt-3 mb-4">Crafted with Passion,<br />Worn with Pride</h1>
        <p className="text-text-muted max-w-2xl mx-auto leading-relaxed">
          Magizhchi Garments was born from a simple belief — every man deserves to look and feel great without breaking the bank. Founded in Chennai, we have been crafting premium menswear since 2010.
        </p>
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="bg-gradient-to-br from-charcoal to-charcoal/80 rounded-3xl p-10 text-center aspect-square flex items-center justify-center">
          <div>
            <div className="text-7xl font-bold text-premium-gold">14+</div>
            <div className="text-white/70 text-lg mt-2">Years of Excellence</div>
          </div>
        </div>
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-text-primary">From a Small Shop to a Trusted Brand</h2>
          <p className="text-text-muted leading-relaxed">
            What started as a small tailoring shop in T. Nagar has grown into one of Tamil Nadu's most loved menswear brands. Our founder, Mr. Selvam, believed that fashion should be accessible to everyone — and that belief drives everything we do today.
          </p>
          <p className="text-text-muted leading-relaxed">
            Every shirt we stitch, every pair of trousers we cut — is made with the same dedication to quality that we had on day one. We source only the finest fabrics, work with skilled craftspeople, and ensure every garment meets our rigorous standards before it reaches you.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6 mb-20">
        <div className="bg-light-bg rounded-2xl p-8 border border-border-light">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-text-primary mb-3">Our Mission</h3>
          <p className="text-text-muted leading-relaxed">
            To provide high-quality, affordable menswear that empowers every man to dress with confidence — whether he's heading to the office, a celebration, or a casual outing.
          </p>
        </div>
        <div className="bg-dark-gradient rounded-2xl p-8 text-white">
          <div className="text-3xl mb-4">🔭</div>
          <h3 className="text-xl font-bold text-premium-gold mb-3">Our Vision</h3>
          <p className="text-white/70 leading-relaxed">
            To be Tamil Nadu's most trusted name in menswear — bringing the joy of beautiful clothing to every household, blending traditional craftsmanship with modern design.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-8">What We Stand For</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '✂️', title: 'Quality First', desc: 'Every stitch, every seam — crafted with precision and care.' },
            { icon: '💰', title: 'Honest Pricing', desc: 'Premium quality at prices that respect your hard-earned money.' },
            { icon: '🤝', title: 'Customer Trust', desc: 'We stand behind every product with our satisfaction guarantee.' },
          ].map(v => (
            <div key={v.title} className="text-center p-6 rounded-2xl bg-white border border-border-light shadow-sm hover:shadow-card-hover transition-shadow">
              <div className="text-4xl mb-4">{v.icon}</div>
              <h4 className="font-bold text-text-primary mb-2">{v.title}</h4>
              <p className="text-sm text-text-muted">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-dark-gradient rounded-3xl p-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['10,000+', 'Happy Customers'], ['500+', 'Products'], ['14+', 'Years in Business'], ['4.8★', 'Avg. Rating']].map(([num, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold text-premium-gold">{num}</p>
              <p className="text-white/60 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
