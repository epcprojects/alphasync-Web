import { toast } from "react-toastify";
import { Cross, ToastSuccessIcon } from "@/icons";

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-right",
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
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Cross />
      <span>{message}</span>
    </div>,
    {
      position: "top-right",
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
      },
    }
  );
};
