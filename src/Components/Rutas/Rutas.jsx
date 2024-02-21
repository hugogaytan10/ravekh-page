import React from "react";
import { NavLink } from "react-router-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "../LandingPage/LandingPage";
import { BlogMain } from "../Blog/BlogMain";
import { MainArticulosIA } from "../Blog/ArticulosIA/MainArticulosIA";
import { ArticuloWhisper } from "../Blog/ArticulosIA/ArticuloWhisper/ArticuloWhisper";
import { MainArticulosReactNative } from "../Blog/ArticulosReactNative/MainArticulosReactNative";
import { ArticuloValeLaPenaReact } from "../Blog/ArticulosReactNative/ArticuloValeLaPenaReact/ArticuloValeLaPenaReact";
import menu from "../../assets/menu.svg";
export const Rutas = () => {
  return (
    <BrowserRouter>
      <div className="drawer ">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content flex flex-col h-full min-w-full">
          <div className="w-full navbar bg-black">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="my-drawer-3"
                aria-label="open sidebar"
              >
                <img
                  src={menu}
                  alt="menu"
                  className="h-10 w-10"
                  htmlFor="my-drawer"
                />
              </label>
            </div>
            <div className=" flex-1 px-2 mx-2 text-gray-50 font-bold justify-center md:justify-start">
              <NavLink to={"/"}>RAVEKH</NavLink>
            </div>
           
            <div className="flex-none hidden lg:block ">
              <ul className="menu menu-horizontal">
                {/* Navbar menu content here */}
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "active-link text-lg bg-white text-black"
                        : "text-white text-lg "
                    }
                    to="/"
                  >
                    Inicio
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                      ? "active-link text-lg bg-white text-black"
                        : "text-white text-lg "
                    }
                    to="/blog"
                  >
                    Blog
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>

          {/* Page content here */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blog" element={<BlogMain />} />
            <Route path="/blog/articulosIA" element={<MainArticulosIA />} />
            <Route
              path="/blog/articulosIA/whisper"
              element={<ArticuloWhisper />}
            />
            <Route
              path="/blog/articulosReactNative"
              element={<MainArticulosReactNative />}
            />
            <Route
              path="/blog/articulosReactNative/valeLaPena"
              element={<ArticuloValeLaPenaReact />}
            />
          </Routes>
        </div>

        <div className="drawer-side z-30">
          <label
            htmlFor="my-drawer-3"
            aria-label="close sidebar"
            className="drawer-overlay "
          ></label>
          <ul className="menu p-4 w-80 min-h-full bg-black">
            {/* Sidebar content here */}
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "active-link text-lg bg-white" : "text-white text-lg"
                }
                onClick={() => {
                  document.getElementById("my-drawer-3").checked = false;
                }}
              >
                Inicio
              </NavLink>
            </li>
            
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "active-link text-lg" : "text-white text-lg"
                }
                to="/blog"
                onClick={() => {
                  document.getElementById("my-drawer-3").checked = false;
                }}
              >
                Blog
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </BrowserRouter>
  );
};
