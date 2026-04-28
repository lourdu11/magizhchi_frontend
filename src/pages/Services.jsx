import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Scissors, Truck, Users, Palette, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const services = [
    {
      title: "Custom Tailoring",
      desc: "Perfect fit, guaranteed. Our master tailors create garments tailored to your specific measurements and style preferences.",
      icon: Scissors,
      color: "bg-blue-50 text-blue-600",
      features: ["Precise Measurements", "Premium Fabric Selection", "Multiple Fittings"]
    },
    {
      title: "Bulk & Corporate Orders",
      desc: "Quality menswear for your team. We handle bulk orders for corporate events, uniforms, and retail partnerships.",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      features: ["Custom Branding", "Scalable Production", "Competitive Pricing"]
    },
    {
      title: "Uniform Manufacturing",
      desc: "Durable and professional uniforms for schools, hospitals, and hospitality sectors with consistent quality.",
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      features: ["Standardized Sizing", "Durable Fabrics", "On-time Delivery"]
    },
    {
      title: "Fashion Consultation",
      desc: "Not sure what suits you best? Our style experts provide personalized consultations for weddings and special events.",
      icon: Palette,
      color: "bg-gold-soft text-premium-gold",
      features: ["Trend Analysis", "Color Matching", "Wedding Specialization"]
    }
  ];

  return (
    <div className="min-h-screen bg-cream-bg py-16">
      <Helmet><title>Our Services — Magizhchi Garments</title></Helmet>

      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black tracking-[0.3em] text-premium-gold uppercase"
          >
            Beyond Clothing
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-charcoal mt-4 mb-6 tracking-tighter"
          >
            Crafting Excellence <br />In Every Stitch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-text-muted text-lg font-medium leading-relaxed"
          >
            We don't just sell clothes; we provide comprehensive garment solutions designed to make you look and feel your absolute best.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[3rem] p-10 border border-border-light shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-premium-gold/5 transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 ${service.color}`}>
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-charcoal mb-4 uppercase tracking-tight">{service.title}</h3>
              <p className="text-text-secondary font-medium mb-8 leading-relaxed">
                {service.desc}
              </p>
              
              <div className="space-y-3 mb-10">
                {service.features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle size={14} className="text-premium-gold" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-text-muted">{f}</span>
                  </div>
                ))}
              </div>

              <Link to="/contact" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-charcoal hover:text-premium-gold transition-colors">
                Enquire Now <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 bg-charcoal rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-premium-gold/10 rounded-full blur-[100px] -mt-20 -mr-20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter">Ready to Start a Project?</h2>
            <p className="text-white/60 max-w-xl mx-auto mb-10 font-medium">Whether it's a single custom shirt or a thousand uniforms, we bring the same level of dedication to every order.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-primary px-12 py-5 rounded-2xl w-full sm:w-auto">Contact Sales</Link>
              <Link to="/about" className="px-12 py-5 border border-white/20 rounded-2xl hover:bg-white/5 transition-all w-full sm:w-auto font-black text-[10px] uppercase tracking-widest">Learn More</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
