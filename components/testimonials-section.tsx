"use client"

import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestimonialsSection() {
  const { t } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const testimonialCount = useRef(0)
  
  const testimonials = [
    {
      name: t("testimonials.user1.name"),
      role: t("testimonials.user1.role"),
      company: t("testimonials.user1.company"),
      text: t("testimonials.user1.text"),
      avatar: "ZM",
      image: "/avatars/avatar-1.png"
    },
    {
      name: t("testimonials.user2.name"),
      role: t("testimonials.user2.role"),
      company: t("testimonials.user2.company"),
      text: t("testimonials.user2.text"),
      avatar: "LH",
      image: "/avatars/avatar-2.png"
    },
    {
      name: t("testimonials.user3.name"),
      role: t("testimonials.user3.role"),
      company: t("testimonials.user3.company"),
      text: t("testimonials.user3.text"),
      avatar: "WF",
      image: "/avatars/avatar-3.png"
    },
    {
      name: t("testimonials.user4.name"),
      role: t("testimonials.user4.role"),
      company: t("testimonials.user4.company"),
      text: t("testimonials.user4.text"),
      avatar: "LW",
      image: "/avatars/avatar-4.png"
    },
    {
      name: t("testimonials.user5.name"),
      role: t("testimonials.user5.role"),
      company: t("testimonials.user5.company"),
      text: t("testimonials.user5.text"),
      avatar: "ZN",
      image: "/avatars/avatar-5.png"
    },
    {
      name: t("testimonials.user6.name"),
      role: t("testimonials.user6.role"),
      company: t("testimonials.user6.company"),
      text: t("testimonials.user6.text"),
      avatar: "SM",
      image: "/avatars/avatar-6.png"
    },
  ]

  // Store testimonial count in a ref to avoid re-creating interval
  useEffect(() => {
    testimonialCount.current = testimonials.length
  }, [testimonials])

  // Fixed autoplay effect using ref
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined
    
    const startRotation = () => {
      if (!autoplay) return
      
      timeoutId = setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % testimonialCount.current)
        startRotation()
      }, 5000)
    }
    
    startRotation()
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [autoplay])

  const nextTestimonial = () => {
    setAutoplay(false)
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setAutoplay(false)
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  // Display 3 testimonials at a time on desktop, centered on activeIndex
  const getVisibleTestimonials = () => {
    const visibleCount = 3
    const halfCount = Math.floor(visibleCount / 2)
    
    let startIdx = activeIndex - halfCount
    if (startIdx < 0) startIdx += testimonials.length
    
    let visibleItems = []
    for (let i = 0; i < visibleCount; i++) {
      const idx = (startIdx + i) % testimonials.length
      visibleItems.push({
        ...testimonials[idx],
        index: idx
      })
    }
    
    return visibleItems
  }

  const visibleTestimonials = getVisibleTestimonials()

  // This initializes autoplay when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (autoplay) {
        setActiveIndex(1)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">{t("testimonials.title")}</h2>
          </div>
        </div>

        {/* Desktop View - Carousel with 3 visible testimonials */}
        <div className="hidden md:block relative">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-0 z-10 -translate-x-1/2" 
              onClick={prevTestimonial}
              onMouseEnter={() => setAutoplay(false)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="grid grid-cols-3 gap-6 mx-12">
              {visibleTestimonials.map((testimonial) => (
                <Card 
                  key={testimonial.index} 
                  className={`h-full transition-all duration-300 ${
                    testimonial.index === activeIndex 
                      ? "scale-105 shadow-lg border-primary/20" 
                      : "opacity-70"
                  }`}
                  onMouseEnter={() => setAutoplay(false)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{testimonial.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-0 z-10 translate-x-1/2" 
              onClick={nextTestimonial}
              onMouseEnter={() => setAutoplay(false)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                className={`w-2 h-2 rounded-full p-0 ${
                  index === activeIndex ? "bg-primary" : "bg-muted-foreground/20"
                }`}
                onClick={() => {
                  setAutoplay(false)
                  setActiveIndex(index)
                }}
                onMouseEnter={() => setAutoplay(false)}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile View - Single Testimonial Carousel */}
        <div className="md:hidden relative">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarFallback>{testimonials[activeIndex].avatar}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">{testimonials[activeIndex].name}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[activeIndex].role}</p>
                  <p className="text-xs text-muted-foreground">{testimonials[activeIndex].company}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{testimonials[activeIndex].text}</p>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-2 mt-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevTestimonial}
              onTouchStart={() => setAutoplay(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {testimonials.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                className={`w-2 h-2 rounded-full p-0 ${
                  index === activeIndex ? "bg-primary" : "bg-muted-foreground/20"
                }`}
                onClick={() => {
                  setAutoplay(false)
                  setActiveIndex(index)
                }}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextTestimonial}
              onTouchStart={() => setAutoplay(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
