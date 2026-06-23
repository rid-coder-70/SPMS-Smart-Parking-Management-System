import { ArrowRight, Check, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Cta4Props {
  title?: string;
  description?: string;
  buttonText?: string;
  to?: string;
  href?: string;
  items?: string[];
  showSecondaryButton?: boolean;
}

const defaultItems = [
  "Real-Time Slot Updates",
  "Advance Reservations",
  "Automated Billing",
  "Enterprise Security",
  "24/7 Availability",
];

export const Cta4 = ({
  title = "Ready to Transform Your Parking?",
  description =
    "Join SPMS and start managing parking reservations with full automation today. No hidden fees, instant setup.",
  buttonText = "Get Started Free",
  to = "/register",
  href,
  items = defaultItems,
  showSecondaryButton = true,
}: Cta4Props) => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative flex flex-col items-start justify-between gap-10 overflow-hidden rounded-3xl px-8 py-12 md:flex-row lg:px-20 lg:py-16"
              style={{
                background:
                  "linear-gradient(135deg, #fff7ed 0%, #fffbeb 55%, #fefce8 100%)",
                border: "1px solid #fed7aa",
                boxShadow:
                  "0 20px 60px rgba(249,115,22,0.12), 0 4px 20px rgba(249,115,22,0.08)",
              }}
            >
              {/* Decorative blobs */}
              <div
                className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(251,146,60,0.22) 0%, transparent 70%)",
                }}
              />
              <div
                className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(250,204,21,0.20) 0%, transparent 70%)",
                }}
              />

              {/* Left: text + CTA */}
              <div className="relative md:w-1/2">
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600">
                  <Rocket className="h-3.5 w-3.5" /> Get Started Today
                </span>
                <h4 className="mb-3 text-2xl font-black text-gray-900 md:text-3xl leading-tight">
                  {title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {description}
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  {href ? (
                    <Button asChild size="lg">
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {buttonText} <ArrowRight className="size-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button asChild size="lg">
                      <Link to={to!}>
                        {buttonText} <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                  {showSecondaryButton && (
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Right: checklist */}
              <div className="relative md:w-5/12">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-orange-500">
                  What's included
                </p>
                <ul className="flex flex-col space-y-3 text-sm font-medium text-gray-700">
                  {items.map((item, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.07 }}
                    >
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 border border-orange-200">
                        <Check className="size-3 text-orange-500" />
                      </span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
