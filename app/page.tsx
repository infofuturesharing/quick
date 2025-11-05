"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MapPin, Phone, Globe, ArrowRight, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"

export default function LandingPage() {
  const { t } = useLanguage()
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Search,
      title: t.featureSearchTitle,
      description: t.featureSearchDesc,
      details: t.featureSearchDetails,
    },
    {
      icon: MapPin,
      title: t.featureMapTitle,
      description: t.featureMapDesc,
      details: t.featureMapDetails,
    },
    {
      icon: Zap,
      title: t.featureSpeedTitle,
      description: t.featureSpeedDesc,
      details: t.featureSpeedDetails,
    },
  ]

  const steps = [
    {
      number: "01",
      title: t.step1Title,
      description: t.step1Desc,
    },
    {
      number: "02",
      title: t.step2Title,
      description: t.step2Desc,
    },
    {
      number: "03",
      title: t.step3Title,
      description: t.step3Desc,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-cyan-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                QuickContact
              </span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
            <Zap className="w-4 h-4" />
            {t.heroTag}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 text-balance leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-xl md:text-2xl text-cyan-100/70 max-w-2xl mx-auto text-pretty">{t.heroSubtitle}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-8 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 text-lg h-14"
              >
                {t.getStarted}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 text-lg h-14 px-8 bg-transparent"
                >
                  {t.howItWorks}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f0f1a] border-cyan-500/20 text-cyan-50 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {t.howItWorks}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-cyan-50 mb-1">{step.title}</h3>
                        <p className="text-cyan-100/70">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                1M+
              </div>
              <div className="text-sm text-cyan-100/60 mt-1">{t.statBusinesses}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {"<"}2s
              </div>
              <div className="text-sm text-cyan-100/60 mt-1">{t.statSpeed}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                24/7
              </div>
              <div className="text-sm text-cyan-100/60 mt-1">{t.statAvailable}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 text-balance">
            {t.featuresTitle}
          </h2>
          <p className="text-xl text-cyan-100/70 max-w-2xl mx-auto text-pretty">{t.featuresSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Dialog
              key={index}
              open={activeFeature === index}
              onOpenChange={(open) => setActiveFeature(open ? index : null)}
            >
              <DialogTrigger asChild>
                <Card className="bg-white/[0.03] backdrop-blur-sm border border-cyan-500/15 hover:border-cyan-400/40 transition-all duration-300 p-8 cursor-pointer group">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-7 h-7 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-cyan-50">{feature.title}</h3>
                    <p className="text-cyan-100/70 text-pretty">{feature.description}</p>
                    <div className="flex items-center text-cyan-400 text-sm font-medium pt-2">
                      {t.learnMore}
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-[#0f0f1a] border-cyan-500/20 text-cyan-50">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {feature.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-cyan-100/80 leading-relaxed">{feature.details}</p>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 text-balance">
              {t.howItWorksTitle}
            </h2>
            <p className="text-xl text-cyan-100/70 text-pretty">{t.howItWorksSubtitle}</p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="bg-white/[0.03] backdrop-blur-sm border border-cyan-500/15 hover:border-cyan-400/40 transition-all duration-300 p-8"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-2xl font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-cyan-50 mb-3">{step.title}</h3>
                    <p className="text-cyan-100/70 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-white/[0.03] backdrop-blur-sm border border-cyan-500/15 p-12 max-w-4xl mx-auto">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-balance">
              {t.contactTitle}
            </h2>
            <p className="text-xl text-cyan-100/70 max-w-2xl mx-auto text-pretty">{t.contactSubtitle}</p>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <a
                href="mailto:info@quickcontact.online"
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all duration-300"
              >
                <Globe className="w-8 h-8 text-cyan-400" />
                <div className="text-cyan-50 font-medium">Email</div>
                <div className="text-cyan-100/70 text-sm">info@quickcontact.online</div>
              </a>

              <a
                href="tel:+905551234567"
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all duration-300"
              >
                <Phone className="w-8 h-8 text-cyan-400" />
                <div className="text-cyan-50 font-medium">{t.phone}</div>
                <div className="text-cyan-100/70 text-sm">+90 555 123 45 67</div>
              </a>

              <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <Clock className="w-8 h-8 text-cyan-400" />
                <div className="text-cyan-50 font-medium">{t.availability}</div>
                <div className="text-cyan-100/70 text-sm">24/7</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-balance">
            {t.ctaTitle}
          </h2>
          <p className="text-xl text-cyan-100/70 text-pretty">{t.ctaSubtitle}</p>
          <Link href="/search">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-12 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 text-lg h-14"
            >
              {t.startSearching}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/10 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-cyan-100/60 text-sm">
            <p>© 2025 QuickContact. {t.footerRights}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
