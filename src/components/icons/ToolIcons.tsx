import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function MergeIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M5 3L3 5L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 5H14C15.1046 5 16 5.89543 16 7V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 3L5 5L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 21L21 19L19 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 19H10C8.89543 19 8 18.1046 8 17V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 21L19 19L19 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CompressIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 16H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function ConvertIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M4 17L8 13L12 17L16 13L20 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 7L16 11L12 7L8 11L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 13V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 13V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 17V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function CutIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="7" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="17" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 16L19 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 16L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 10L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function OrganizeIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function RotateIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M1 4V10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.51 15C4.15839 16.8404 5.38734 18.4202 7.01166 19.5014C8.63598 20.5826 10.5677 21.1067 12.5276 20.9945C14.4875 20.8823 16.3445 20.1397 17.8284 18.8795C19.3124 17.6193 20.3425 15.909 20.94 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 4V10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.49 9C19.8416 7.15955 18.6127 5.57977 16.9883 4.49857C15.364 3.41737 13.4323 2.8933 11.4724 3.00549C9.5125 3.11768 7.6555 3.8603 6.17157 5.12047C4.68765 6.38065 3.65749 8.09097 3.06001 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PdfIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 13H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 17H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 9H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export const toolIcons = {
  merge: MergeIcon,
  compress: CompressIcon,
  convert: ConvertIcon,
  cut: CutIcon,
  organize: OrganizeIcon,
  rotate: RotateIcon,
  pdf: PdfIcon,
} as const;
