"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Hana Kim",
    role: "Rhinoplasty patient",
    image: "/user/female-1.jpg",
    quote:
      "MediBridge made comparing clinics feel simple and safe. I understood every price, every step, and never felt pressured into making a decision.",
  },
  {
    name: "Daniel Park",
    role: "Dermatology patient",
    image: "/user/male-1.jpg",
    quote:
      "The clinic recommendations were clear and genuinely helpful. Booking, translation, and payment all worked together without any confusing handoffs.",
  },
  {
    name: "Sora Lim",
    role: "International patient",
    image: "/user/female-2.jpg",
    quote:
      "I could ask questions in my own language before flying to Seoul. That support gave me the confidence to choose the right clinic for me.",
  },
  {
    name: "Minho Choi",
    role: "Plastic surgery patient",
    image: "/user/male-2.jpg",
    quote:
      "Everything was transparent from the first consultation to recovery. The escrow payment option made the entire experience feel much more secure.",
  },
  {
    name: "Mei Lin",
    role: "Dental care patient",
    image: "/user/female-3.jpg",
    quote:
      "The Chinese language support was excellent. My coordinator explained the treatment plan clearly and stayed in touch throughout my visit.",
  },
  {
    name: "Yuki Tanaka",
    role: "Aesthetic care patient",
    image: "/user/male-3.jpg",
    quote:
      "Reviews and verified clinic details saved me hours of research. I arrived knowing exactly what to expect, and the service matched the listing.",
  },
  {
    name: "Omar Hassan",
    role: "Health screening patient",
    image: "/user/male-4.jpg",
    quote:
      "MediBridge turned a complicated overseas booking into a smooth journey. The communication was fast, professional, and reassuring from start to finish.",
  },
];

const carouselItems = [...testimonials, ...testimonials];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((current) => current + 1);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [paused]);

  const finishSlide = () => {
    if (index < testimonials.length) return;
    setAnimate(false);
    setIndex(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
  };

  const goTo = (nextIndex: number) => {
    setAnimate(true);
    setIndex(nextIndex);
  };

  return (
    <section className="relative z-10 overflow-hidden border-t border-brand-line/70 bg-white px-6 py-20 shadow-[0_-14px_34px_-20px_rgba(13,59,59,0.42)] sm:px-10 sm:py-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="text-center">
          <span className="inline-flex bg-brand-teal-700 px-2 py-1 text-sm font-bold uppercase tracking-[0.12em] text-white">
            Testimonials
          </span>
          <h2 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
            What Patients Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-brand-muted sm:text-lg">
            Hear from international patients who found trusted clinics, clear communication, and safer care through MediBridge.
          </p>
        </div>

        <div
          className="mt-14 overflow-hidden sm:mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className={`flex w-[1400%] will-change-transform sm:w-[700%] lg:w-[466.6667%] ${
              animate
                ? "transition-transform duration-[1000ms] ease-[cubic-bezier(.22,.61,.36,1)]"
                : "transition-none"
            }`}
            style={{ transform: `translate3d(-${index * (100 / carouselItems.length)}%, 0, 0)` }}
            onTransitionEnd={finishSlide}
          >
            {carouselItems.map((testimonial, itemIndex) => (
              <article key={`${testimonial.name}-${itemIndex}`} className="w-[7.142857%] shrink-0 px-2.5 sm:px-3">
                <div className="relative flex min-h-[310px] flex-col bg-[#f3f7fb] px-8 py-10 sm:px-10 sm:py-11">
                  <span aria-hidden="true" className="font-serif text-6xl leading-none text-brand-teal-100">
                    “
                  </span>
                  <p className="mt-3 text-lg leading-8 text-[#56657a]">
                    {testimonial.quote}
                  </p>
                  <span className="absolute -bottom-5 left-10 h-10 w-10 rotate-45 bg-[#f3f7fb]" aria-hidden="true" />
                </div>

                <div className="relative z-10 mt-8 flex items-center gap-4 px-7">
                  <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      sizes="72px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-ink">{testimonial.name}</h3>
                    <p className="mt-1 text-sm text-brand-muted sm:text-base">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-2" aria-label="Choose testimonial slide">
          {testimonials.map((testimonial, dotIndex) => (
            <button
              key={testimonial.name}
              type="button"
              onClick={() => goTo(dotIndex)}
              aria-label={`Show testimonial ${dotIndex + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index % testimonials.length === dotIndex
                  ? "w-8 bg-brand-teal-700"
                  : "w-2.5 bg-brand-teal-100 hover:bg-brand-teal-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
