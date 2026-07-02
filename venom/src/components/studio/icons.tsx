"use client";

/**
 * Centrální ikonový registry Webero Studia.
 *
 * Ikony jsou z rodiny Phosphor (@phosphor-icons/react), ale exportované pod
 * jmény kompatibilními s lucide-react — výměna rodiny proběhla 1:1 náhradou
 * importů (`from "@/components/studio/icons"` → `from "@/components/studio/icons"`) bez
 * přejmenovávání ve 47 souborech. Nové studio komponenty importují odsud.
 *
 * Konvence vah:
 *  - default "regular" (vizuálně odpovídá lucide stroke ~1.6)
 *  - aktivní/zvýrazněné stavy mohou předat weight="duotone" | "fill"
 *  - `strokeWidth` prop je přijímán a ignorován (lucide kompatibilita)
 */

import type { ComponentType } from "react";
import type { Icon as PhosphorIcon, IconProps as PhosphorIconProps, IconWeight } from "@phosphor-icons/react";
import {
  WarningCircle, TextAlignCenter, TextAlignJustify, TextAlignLeft, TextAlignRight,
  AlignCenterVertical as PhAlignCenterVertical, AlignLeft as PhAlignLeft, AlignRight as PhAlignRight,
  Anchor as PhAnchor,
  ArrowDown as PhArrowDown, ArrowLeft as PhArrowLeft, ArrowRight as PhArrowRight, ArrowUp as PhArrowUp,
  ArrowsDownUp, ChartBar, Bell as PhBell, TextB, BookOpen as PhBookOpen, Cube,
  Briefcase as PhBriefcase, Buildings, Calendar as PhCalendar, TextAa,
  Check as PhCheck, CheckSquare as PhCheckSquare,
  CaretDown, CaretLeft, CaretRight, CaretUp, CaretDoubleDown, CaretDoubleUp,
  ClipboardText, Clipboard as PhClipboard, Clock as PhClock, ClockCounterClockwise, Copy as PhCopy,
  CreditCard as PhCreditCard, Drop, ArrowSquareOut, Eye as PhEye, EyeSlash,
  Feather as PhFeather, FileText as PhFileText,
  Folder as PhFolder, FolderOpen as PhFolderOpen, FolderPlus as PhFolderPlus, Files as PhFiles,
  Globe as PhGlobe, DotsSixVertical, Question, House,
  Image as PhImage, Images as PhImages, Info as PhInfo, TextItalic,
  Keyboard as PhKeyboard, Stack, Layout as PhLayout, SquaresFour, GridFour, Books,
  LinkSimple, Link as PhLink, LinkBreak, LinkSimpleBreak,
  List as PhList, ListNumbers, CircleNotch, Lock as PhLock, SignOut,
  EnvelopeSimple, MapTrifold, Megaphone as PhMegaphone, Chat,
  Minus as PhMinus, Monitor as PhMonitor, DotsThree, Cursor, CursorClick,
  NavigationArrow, Newspaper as PhNewspaper, Palette as PhPalette, SidebarSimple,
  PencilSimple, Phone as PhPhone, Plus as PhPlus, Receipt as PhReceipt,
  ArrowUUpRight, ArrowsClockwise, RocketLaunch, ArrowCounterClockwise,
  MagnifyingGlass, GearSix, Sliders, Shapes as PhShapes, ShareNetwork,
  SlidersHorizontal as PhSlidersHorizontal, DeviceMobile, Sparkle,
  Square as PhSquare, TextStrikethrough, DeviceTablet, Tag as PhTag, Trash,
  TextT, TextUnderline, ArrowUUpLeft, UploadSimple,
  User as PhUser, Users as PhUsers, X as PhX,
  MagnifyingGlassPlus, MagnifyingGlassMinus,
} from "@phosphor-icons/react";

export interface IconProps extends Omit<PhosphorIconProps, "weight" | "size"> {
  /** lucide kompatibilita — Phosphor tloušťku řídí weight, prop se ignoruje */
  strokeWidth?: number;
  size?: number;
  weight?: IconWeight;
}

/** Kompatibilní alias — starší kód typuje ikony jako LucideIcon. */
export type LucideIcon = ComponentType<IconProps>;

function wrap(Icon: PhosphorIcon, defaultWeight: IconWeight = "regular"): LucideIcon {
  function WrappedIcon({ strokeWidth: _strokeWidth, weight, size, ...rest }: IconProps) {
    return <Icon weight={weight ?? defaultWeight} size={size ?? 24} {...rest} />;
  }
  WrappedIcon.displayName = `Vs${Icon.displayName ?? "Icon"}`;
  return WrappedIcon;
}

export const AlertCircle = wrap(WarningCircle);
export const AlignCenter = wrap(TextAlignCenter);
export const AlignCenterVertical = wrap(PhAlignCenterVertical);
export const AlignEndVertical = wrap(PhAlignRight);
export const AlignJustify = wrap(TextAlignJustify);
export const AlignLeft = wrap(TextAlignLeft);
export const AlignRight = wrap(TextAlignRight);
export const AlignStartVertical = wrap(PhAlignLeft);
export const Anchor = wrap(PhAnchor);
export const ArrowDown = wrap(PhArrowDown);
export const ArrowLeft = wrap(PhArrowLeft);
export const ArrowRight = wrap(PhArrowRight);
export const ArrowUp = wrap(PhArrowUp);
export const ArrowUpDown = wrap(ArrowsDownUp);
export const BarChart2 = wrap(ChartBar);
export const Bell = wrap(PhBell);
export const Bold = wrap(TextB);
export const BookOpen = wrap(PhBookOpen);
export const Boxes = wrap(Cube);
export const Briefcase = wrap(PhBriefcase);
export const Building2 = wrap(Buildings);
export const Calendar = wrap(PhCalendar);
export const CaseUpper = wrap(TextAa);
export const Check = wrap(PhCheck);
export const CheckSquare = wrap(PhCheckSquare);
export const ChevronDown = wrap(CaretDown);
export const ChevronLeft = wrap(CaretLeft);
export const ChevronRight = wrap(CaretRight);
export const ChevronUp = wrap(CaretUp);
export const ChevronsDown = wrap(CaretDoubleDown);
export const ChevronsUp = wrap(CaretDoubleUp);
export const ClipboardList = wrap(ClipboardText);
export const ClipboardPaste = wrap(PhClipboard);
export const Clock = wrap(PhClock);
export const Copy = wrap(PhCopy);
export const CreditCard = wrap(PhCreditCard);
export const Droplet = wrap(Drop);
export const ExternalLink = wrap(ArrowSquareOut);
export const Eye = wrap(PhEye);
export const EyeOff = wrap(EyeSlash);
export const Feather = wrap(PhFeather);
export const FileText = wrap(PhFileText);
export const Files = wrap(PhFiles);
export const Folder = wrap(PhFolder);
export const FolderOpen = wrap(PhFolderOpen);
export const FolderPlus = wrap(PhFolderPlus);
export const Globe = wrap(PhGlobe);
export const GripVertical = wrap(DotsSixVertical);
export const HelpCircle = wrap(Question);
export const History = wrap(ClockCounterClockwise);
export const Home = wrap(House);
export const Image = wrap(PhImage);
export const ImageIcon = Image; // lucide alias kompatibilita
export const Images = wrap(PhImages);
export const Info = wrap(PhInfo);
export const Italic = wrap(TextItalic);
export const Keyboard = wrap(PhKeyboard);
export const Layers = wrap(Stack);
export const Layout = wrap(PhLayout);
export const LayoutDashboard = wrap(SquaresFour);
export const LayoutGrid = wrap(GridFour);
export const Library = wrap(Books);
export const Link = wrap(LinkSimple);
export const Link2 = wrap(PhLink);
export const Link2Off = wrap(LinkBreak);
export const List = wrap(PhList);
export const ListOrdered = wrap(ListNumbers);
export const Loader2 = wrap(CircleNotch);
export const Lock = wrap(PhLock);
export const LogOut = wrap(SignOut);
export const Mail = wrap(EnvelopeSimple);
export const Map = wrap(MapTrifold);
export const Megaphone = wrap(PhMegaphone);
export const MessageSquare = wrap(Chat);
export const Minus = wrap(PhMinus);
export const Monitor = wrap(PhMonitor);
export const MoreHorizontal = wrap(DotsThree);
export const MousePointer = wrap(Cursor);
export const MousePointer2 = wrap(Cursor);
export const MousePointerClick = wrap(CursorClick);
export const Navigation = wrap(NavigationArrow);
export const Newspaper = wrap(PhNewspaper);
export const Palette = wrap(PhPalette);
export const PanelLeft = wrap(SidebarSimple);
export const Pencil = wrap(PencilSimple);
export const Phone = wrap(PhPhone);
export const Plus = wrap(PhPlus);
export const Receipt = wrap(PhReceipt);
export const Redo2 = wrap(ArrowUUpRight);
export const RefreshCw = wrap(ArrowsClockwise);
export const Rocket = wrap(RocketLaunch);
export const RotateCcw = wrap(ArrowCounterClockwise);
export const Search = wrap(MagnifyingGlass);
export const Settings = wrap(GearSix);
export const Settings2 = wrap(Sliders);
export const Shapes = wrap(PhShapes);
export const Share2 = wrap(ShareNetwork);
export const SlidersHorizontal = wrap(PhSlidersHorizontal);
export const Smartphone = wrap(DeviceMobile);
export const Sparkles = wrap(Sparkle);
export const Square = wrap(PhSquare);
export const Strikethrough = wrap(TextStrikethrough);
export const Tablet = wrap(DeviceTablet);
export const Tag = wrap(PhTag);
export const Trash2 = wrap(Trash);
export const Type = wrap(TextT);
export const Underline = wrap(TextUnderline);
export const Undo2 = wrap(ArrowUUpLeft);
export const Unlink = wrap(LinkSimpleBreak);
export const Upload = wrap(UploadSimple);
export const User = wrap(PhUser);
export const Users = wrap(PhUsers);
export const X = wrap(PhX);
export const ZoomIn = wrap(MagnifyingGlassPlus);
export const ZoomOut = wrap(MagnifyingGlassMinus);
