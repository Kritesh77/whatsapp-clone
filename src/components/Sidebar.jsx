import DesktopSidebar from "./subComponents/DesktopSidebar";
import useResize from "../hooks/useResize";
export default function Sidebar() {
  let isMobile = useResize();
  console.log("sidebar is mobile", isMobile);
  return <>{!isMobile && <DesktopSidebar />}</>;
}
