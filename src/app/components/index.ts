import ThemeButton from "./ui/buttons/ThemeButton";
import ToggleGroup from "./ui/buttons/ToggleGroup";
import AuthHeader from "./AuthHeader";
import ThemeInput from "./ui/inputs/ThemeInput";
import ProductSelect from "./ui/inputs/ProductSelect";
import CustomerSelect from "./ui/inputs/CustomerSelect";
import AttributionCard from "./ui/cards/AttributionCard";
import LoginBanner from "./LoginBanner";
import Portal from "./ui/portal";
import InfoModal from "./ui/modals/InfoModal";
import InfoList from "./ui/cards/InfoList";
import Header from "./layout/header";
import DashboardStats from "./layout/DashboardStats";
import ProductCard from "./ui/cards/ProductCard";
import ProductListView from "./ui/cards/ProductListView";
import AppModal from "./ui/modals/AppModal";
import SelectGroupDropdown from "./ui/dropdowns/selectgroupDropdown";
import ProductSwiper from "./ui/Swiper/ProductSwiper";
import CustomerDatabaseView from "./ui/cards/CustomerDatabaseView";
import Stepper from "./Stepper";
import TextAreaField from "./ui/inputs/TextAreaField";
import ChatMessage from "./ui/cards/ChatMessage";
import QuickTemplates from "./ui/cards/QuickTemplates";
import NoteCard from "./ui/cards/NoteCard";
import CustomerOrderHistroyView from "./ui/cards/CustomerOrderHistroyView";
import OrderModal from "./ui/modals/OrderModal";
import PrescriptionRequestCard from "./ui/cards/PrescriptionRequestCard";
import RequestRejectModal from "./ui/modals/RequestRejectModal";
import RequestApproveModal from "./ui/modals/RequestApproveModal";
import MessageSendModal from "./ui/modals/MessageSendModal";
import NotificationToggle from "./ui/buttons/NotificationToggle";
import Loader from "./ui/Loader";
import EmptyState from "./ui/EmptyState";
import { toastAlert } from "./ToastAlert";
import OTPVerify from "./OtpVerify";
import Skeleton from "@/app/components/Skelton";
import InventorySkeleton from "./ui/InventorySkeleton";
import RequestListSkeleton from "./ui/RequestListSkeleton";
import Pagination from "./ui/Pagination";
import ChangePassword from "@/app/components/ChangePassword";
import ImageUpload from "@/app/components/ImageUpload";
import Chat from "./ui/chat/Chat";
import {
  RoleBasedRoute,
  AdminRoute,
  DoctorRoute,
  CustomerRoute,
  DoctorOrAdminRoute,
} from "./RoleBasedRoute";

export {
  EmptyState,
  Loader,
  NotificationToggle,
  MessageSendModal,
  ThemeButton,
  ToggleGroup,
  AuthHeader,
  ThemeInput,
  ProductSelect,
  CustomerSelect,
  AttributionCard,
  LoginBanner,
  Portal,
  InfoModal,
  InfoList,
  Header,
  DashboardStats,
  ProductCard,
  ProductListView,
  AppModal,
  SelectGroupDropdown,
  ProductSwiper,
  CustomerDatabaseView,
  Stepper,
  TextAreaField,
  ChatMessage,
  QuickTemplates,
  NoteCard,
  CustomerOrderHistroyView,
  OrderModal,
  PrescriptionRequestCard,
  RequestRejectModal,
  RequestApproveModal,
  toastAlert,
  OTPVerify,
  Skeleton,
  InventorySkeleton,
  RequestListSkeleton,
  Pagination,
  ChangePassword,
  ImageUpload,
  Chat,
  RoleBasedRoute,
  AdminRoute,
  DoctorRoute,
  CustomerRoute,
  DoctorOrAdminRoute,
};
