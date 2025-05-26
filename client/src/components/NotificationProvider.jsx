import { SnackbarProvider } from "notistack";

const NotificationProvider = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {children}
    </SnackbarProvider>
  );
};

export default NotificationProvider;
