import { useSelector } from "react-redux";

/**
 * useRole — Returns the current user's role and convenience booleans.
 *
 * Reads from Redux state.user.data (populated by fetchUser / login).
 * The role field is present on the user object returned from /api/auth/me
 * because the User model now includes it.
 *
 * @returns {{ role: string|undefined, isAdmin: boolean, isViewer: boolean }}
 */
const useRole = () => {
  const role = useSelector((state) => state.user.data?.role);

  return {
    role,
    isAdmin: role === "admin",
    isViewer: role === "viewer",
  };
};

export default useRole;
