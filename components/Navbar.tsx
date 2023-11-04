"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Stars } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { Button } from "./ui/button";
import ThemeToggle from "@/components/theme-toggle";
import MobileSidebar from "./MobileSidebar";

const font = Poppins({
  weight: "600",
  subsets: ["latin"],
});

const Navbar = () => {
  return (
    <div
      className="fixed w-full h-16 z-50 flex justify-between items-center
        py-2 px-4 border-b border-primary/10 bg-secondary"
    >
      <div className="flex items-center">
        <MobileSidebar />
        <Link href="/">
          <h1
            className={cn(
              "hidden md:block text-xl md:text-3xl font-bold text-primary",
              font.className
            )}
          >
            personifAI
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-x-3">
        <ThemeToggle />
        <Button variant="premium" size="sm">
          Upgrade <Stars className="h-4 w-4 fill-white text-white ml-2" />
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
