"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils";
import { toast } from "@/components/ui/use-toast";
import {
  Share2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Smartphone,
} from "lucide-react";

// Social platform icons as SVG components
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export interface ShareWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  weatherData: {
    location: string;
    temperature: number;
    unit: string;
    condition: string;
    highTemp: number;
    lowTemp: number;
    precipChance?: number;
  };
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  getShareUrl: (text: string, url: string) => string;
}

export default function ShareWeatherModal({
  isOpen,
  onClose,
  weatherData,
}: ShareWeatherModalProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || "dark") as ThemeType, "modal");

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canUseNativeShare, setCanUseNativeShare] = useState(false);

  // Check for native share support on mount
  useEffect(() => {
    setCanUseNativeShare(
      typeof navigator !== "undefined" && "share" in navigator
    );
  }, []);

  // Generate share text
  const generateShareText = useCallback(() => {
    const { location, temperature, unit, condition } = weatherData;
    return `It's ${Math.round(temperature)}${unit} and ${condition.toLowerCase()} in ${location}! Check your forecast at 16bitweather.co`;
  }, [weatherData]);

  // Generate share URL for the location
  const generateShareUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://16bitweather.co";
    const citySlug = weatherData.location
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `${baseUrl}/weather/${encodeURIComponent(citySlug)}`;
  }, [weatherData.location]);

  // Share platforms configuration
  const platforms: SharePlatform[] = [
    {
      id: "x",
      name: "X (Twitter)",
      icon: <XIcon className="w-5 h-5" />,
      color: "bg-black",
      hoverColor: "hover:bg-gray-800",
      getShareUrl: (text, url) =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FacebookIcon className="w-5 h-5" />,
      color: "bg-[#1877F2]",
      hoverColor: "hover:bg-[#166FE5]",
      getShareUrl: (text, url) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <LinkedInIcon className="w-5 h-5" />,
      color: "bg-[#0A66C2]",
      hoverColor: "hover:bg-[#095196]",
      getShareUrl: (_text, url) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ];

  // Handle platform share
  const handlePlatformShare = async (platform: SharePlatform) => {
    setIsGenerating(true);

    // Simulate generating weather card (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const text = generateShareText();
    const url = generateShareUrl();
    const shareUrl = platform.getShareUrl(text, url);

    // Open share dialog in new window
    const windowFeatures = "width=600,height=400,scrollbars=yes,resizable=yes";
    window.open(shareUrl, "_blank", windowFeatures);

    setIsGenerating(false);

    toast({
      title: "SHARE OPENED",
      description: `Opening ${platform.name} share dialog...`,
      duration: 3000,
      className: "font-mono uppercase tracking-wider border-2",
    });
  };

  // Handle native share (mobile)
  const handleNativeShare = async () => {
    if (!canUseNativeShare) return;

    setIsGenerating(true);

    // Simulate generating weather card
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const text = generateShareText();
    const url = generateShareUrl();

    try {
      await navigator.share({
        title: `Weather in ${weatherData.location}`,
        text: text,
        url: url,
      });

      toast({
        title: "SHARED!",
        description: "Weather shared successfully",
        duration: 3000,
        className: "font-mono uppercase tracking-wider border-2",
      });
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    const url = generateShareUrl();
    const text = generateShareText();
    const fullText = `${text}\n\n${url}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);

      toast({
        title: "LINK COPIED!",
        description: "Weather link copied to clipboard",
        duration: 3000,
        className: "font-mono uppercase tracking-wider border-2",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "COPY FAILED",
        description: "Could not copy to clipboard",
        variant: "destructive",
        duration: 3000,
        className: "font-mono uppercase tracking-wider border-2",
      });
    }
  };

  const { location, temperature, unit, condition, highTemp, lowTemp, precipChance } =
    weatherData;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "sm:max-w-md border-4",
          themeClasses.background,
          themeClasses.borderColor
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-xl font-bold font-mono uppercase tracking-wider flex items-center gap-2",
              themeClasses.headerText
            )}
          >
            <Share2 className="w-5 h-5" />
            Share Weather
          </DialogTitle>
          <DialogDescription className={cn("font-mono text-sm", themeClasses.text)}>
            Share the current weather with your friends
          </DialogDescription>
        </DialogHeader>

        {/* Weather Preview Card */}
        <div
          className={cn(
            "p-4 border-2 rounded-lg space-y-2",
            themeClasses.borderColor,
            themeClasses.cardBg
          )}
        >
          <div className="flex items-center justify-between">
            <span className={cn("font-mono font-bold text-lg", themeClasses.accentText)}>
              {location}
            </span>
            <span className={cn("text-2xl font-bold font-mono", themeClasses.text)}>
              {Math.round(temperature)}{unit}
            </span>
          </div>
          <div className={cn("text-sm font-mono capitalize", themeClasses.text)}>
            {condition.toLowerCase()}
          </div>
          <div className={cn("flex gap-4 text-xs font-mono", themeClasses.secondary)}>
            <span>H: {Math.round(highTemp)}{unit}</span>
            <span>L: {Math.round(lowTemp)}{unit}</span>
            {precipChance !== undefined && precipChance > 0 && (
              <span>{precipChance}% precip</span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div
            className={cn(
              "flex items-center justify-center gap-2 py-4",
              themeClasses.text
            )}
            role="status"
            aria-label="Generating weather card"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-mono text-sm">Generating your weather card...</span>
          </div>
        )}

        {/* Share Options */}
        {!isGenerating && (
          <div className="space-y-3">
            {/* Native Share Button (Mobile) */}
            {canUseNativeShare && (
              <Button
                onClick={handleNativeShare}
                className={cn(
                  "w-full font-mono font-bold uppercase tracking-wider",
                  themeClasses.accentBg,
                  "text-black"
                )}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Share via Device
              </Button>
            )}

            {/* Platform Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {platforms.map((platform) => (
                <Button
                  key={platform.id}
                  onClick={() => handlePlatformShare(platform)}
                  disabled={isGenerating}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 h-auto py-3",
                    platform.color,
                    platform.hoverColor,
                    "text-white transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label={`Share to ${platform.name}`}
                >
                  {platform.icon}
                  <span className="text-xs font-mono">{platform.name.split(" ")[0]}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className={cn("flex-1 h-px", themeClasses.borderColor, "bg-current opacity-30")} />
              <span className={cn("text-xs font-mono uppercase", themeClasses.secondary)}>or</span>
              <div className={cn("flex-1 h-px", themeClasses.borderColor, "bg-current opacity-30")} />
            </div>

            {/* Copy Link Button */}
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className={cn(
                "w-full font-mono font-bold uppercase tracking-wider",
                themeClasses.borderColor,
                themeClasses.text,
                themeClasses.hoverBg
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info Text */}
        <p className={cn("text-xs font-mono text-center", themeClasses.secondary)}>
          Share includes weather details and a link to 16bitweather.co
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ShareButton Component
export interface ShareButtonProps {
  weatherData: ShareWeatherModalProps["weatherData"];
  variant?: "icon" | "button";
  className?: string;
}

export function ShareButton({
  weatherData,
  variant = "button",
  className,
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || "dark") as ThemeType, "button");

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  if (variant === "icon") {
    return (
      <>
        <Button
          onClick={handleClick}
          variant="ghost"
          size="icon"
          className={cn(
            "transition-all duration-200",
            themeClasses.hoverBg,
            className
          )}
          aria-label="Share weather"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <ShareWeatherModal
          isOpen={isModalOpen}
          onClose={handleClose}
          weatherData={weatherData}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outline"
        className={cn(
          "font-mono uppercase tracking-wider transition-all duration-200",
          themeClasses.borderColor,
          themeClasses.text,
          themeClasses.hoverBg,
          className
        )}
        aria-label="Share weather"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      <ShareWeatherModal
        isOpen={isModalOpen}
        onClose={handleClose}
        weatherData={weatherData}
      />
    </>
  );
}
