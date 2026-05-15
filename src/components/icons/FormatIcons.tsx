import { type SVGProps } from "react";
import { FileText, FileImage, FileType, File } from "lucide-react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function DocxIcon({ size = 24, className, ...props }: IconProps) {
  return <FileText size={size} className={className} {...props} />;
}

export function XlsxIcon({ size = 24, className, ...props }: IconProps) {
  return <FileText size={size} className={className} {...props} />;
}

export function PptxIcon({ size = 24, className, ...props }: IconProps) {
  return <FileText size={size} className={className} {...props} />;
}

export function JpgIcon({ size = 24, className, ...props }: IconProps) {
  return <FileImage size={size} className={className} {...props} />;
}

export function PngIcon({ size = 24, className, ...props }: IconProps) {
  return <FileImage size={size} className={className} {...props} />;
}

export function TxtIcon({ size = 24, className, ...props }: IconProps) {
  return <FileType size={size} className={className} {...props} />;
}

export function OcrIcon({ size = 24, className, ...props }: IconProps) {
  return <File size={size} className={className} {...props} />;
}

export function FormatBadgeIcon({ format, size = 20 }: { format: string; size?: number }) {
  const colorMap: Record<string, string> = {
    pdf: "text-red-400",
    docx: "text-blue-400",
    xlsx: "text-green-400",
    pptx: "text-orange-400",
    jpg: "text-pink-400",
    png: "text-cyan-400",
    txt: "text-slate-400",
  };

  const IconComponent: Record<string, React.ComponentType<IconProps>> = {
    pdf: FileText,
    docx: DocxIcon,
    xlsx: XlsxIcon,
    pptx: PptxIcon,
    jpg: JpgIcon,
    png: PngIcon,
    txt: TxtIcon,
  };

  const Icon = IconComponent[format.toLowerCase()] || File;
  const color = colorMap[format.toLowerCase()] || "text-slate-400";

  return (
    <span className={`inline-flex items-center justify-center ${color}`}>
      <Icon size={size} />
    </span>
  );
}
