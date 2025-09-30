import { toast } from "react-toastify";
import { Cross, ToastSuccessIcon } from "@/icons";
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: isMobile ? "bottom-center" : "top-right",
    icon: <ToastSuccessIcon />,
    closeButton: false,
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      width: "fit-content",
      maxHeight: "44px",
      minHeight: "44px",
      backgroundColor: "#079455",
      color: "white",
      borderRadius: "8px",
      marginBottom: isMobile ? "20px" : "0px",
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(
    <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
      <Cross />
      <span>{message}</span>
    </div>,
    {
      position: isMobile ? "bottom-center" : "top-right",
      closeButton: false,
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: false,
      style: {
        width: "fit-content",
        maxHeight: "44px",
        minHeight: "44px",
        background: "red",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        borderRadius: "8px",
        marginBottom: isMobile ? "20px" : "0px",
      },
    }
  );
};
