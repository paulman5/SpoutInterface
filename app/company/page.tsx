"use client"
import Image from "next/image"

import { PixelTrail } from "@/components/ui/pixel-trail"
import DefaultFooter from "@/components/footer"
import { Linkedin } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { HowItWorksSection } from "@/components/features/root"

const team = [
  {
    name: "Marc Ryan",
    title: "Co-Founder & CEO",
    img: "/HeadshotMarc.png",
    bio: "Marc leads technology and product at Spout Finance, with a passion for building secure, scalable financial systems.",
    linkedin: "https://www.linkedin.com/in/marc-ryan/",
  },
  {
    name: "Paul van Mierlo",
    title: "Co-Founder & CTO",
    img: "/HeadshotPaul.jpg",
    bio: "Paul brings years of expertise in programming having won major hackathon competitions on different blockchain ecosystems with privacy, payments and DeFi solutions.",
    linkedin: "https://www.linkedin.com/in/paul-van-mierlo-063b9417a/",
  },
  {
    name: "Paul Jan Reijn",
    title: "Co-Founder & General Counsel",
    img: "/HeadshotPJ.png",
    bio: "PJ oversees operations and growth, ensuring seamless execution and a world-class user experience.",
    linkedin: "https://www.linkedin.com/in/paul-jan-reijn-70b635227/",
  },
]

export default function AboutPage() {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-page PixelTrail background */}
      <div className="absolute inset-0 z-0">
        <PixelTrail
          fadeDuration={1200}
          delay={300}
          pixelClassName="rounded-2xl bg-emerald-600/15"
          pixelSize={40}
        />
      </div>
      
      {/* Team Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 space-y-24 mt-28">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
            Meet the Spout Finance Team
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Spout is dedicated to building the most secure, transparent, and
            user-friendly platform for tokenized real-world assets. Our team
            brings together deep expertise in finance, technology, and operations
            to deliver a next-generation DeFi experience.
          </p>
        </div>
        
        {team.map((member, idx) => {
          const isHovered = hoveredMember === member.name
          
          return (
            <div
              key={member.name}
              className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${idx % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              <div
                className="w-full md:w-1/2 flex justify-center relative group"
                onMouseEnter={() => setHoveredMember(member.name)}
                onMouseLeave={() => setHoveredMember(null)}
                onFocus={() => setHoveredMember(member.name)}
                onBlur={() => setHoveredMember(null)}
                tabIndex={0}
              >
                <Image
                  src={member.img}
                  alt={member.name}
                  width={350}
                  height={350}
                  className="rounded-2xl object-cover shadow-xl"
                  priority
                  style={{
                    aspectRatio: "1 / 1",
                    maxWidth: 350,
                    maxHeight: 350,
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />
                {/* Enhanced LinkedIn Overlay with animated glow on group hover */}
                <motion.a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.98,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl transition-opacity cursor-pointer focus-visible:ring-4 focus-visible:ring-emerald-400/60 z-10"
                  aria-label={`View ${member.name}'s LinkedIn`}
                  style={{
                    background: "rgba(30, 41, 59, 0.45)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                  tabIndex={-1}
                >
                  <motion.span
                    initial={{
                      scale: 0.85,
                      boxShadow: "0 0 0 0 rgba(16,185,129,0.3)",
                    }}
                    animate={
                      isHovered
                        ? {
                            boxShadow: [
                              "0 0 24px 8px rgba(16,185,129,0.15)",
                              "0 0 36px 16px rgba(16,185,129,0.35)",
                              "0 0 24px 8px rgba(16,185,129,0.15)",
                            ],
                            transition: {
                              repeat: Infinity,
                              repeatType: "loop",
                              duration: 1.2,
                              ease: "easeInOut",
                            },
                            scale: 1.08,
                          }
                        : {
                            scale: 1,
                            boxShadow: "0 0 0 0 rgba(16,185,129,0.3)",
                          }
                    }
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex items-center justify-center rounded-full bg-white/90 shadow-lg border-2 border-emerald-200"
                    style={{ width: 72, height: 72 }}
                  >
                    <Linkedin className="w-10 h-10 text-emerald-600" />
                  </motion.span>
                </motion.a>
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {member.name}
                </h2>
                <div className="text-emerald-700 font-semibold mb-4 text-lg">
                  {member.title}
                </div>
                <p className="text-slate-600 text-base mb-2 max-w-xl">
                  {member.bio}
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />
      
      <DefaultFooter />
    </div>
  )
}
