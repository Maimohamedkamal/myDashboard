import { Outlet } from "react-router-dom";

export default function Authlayout() {
  return (
    <div className="flex">
  

        <Outlet />
      </div>
  );
}