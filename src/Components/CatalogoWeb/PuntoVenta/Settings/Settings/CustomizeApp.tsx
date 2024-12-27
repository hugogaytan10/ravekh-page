import React, { useState, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeLight } from "../../Theme/Theme";
import { PickerColor } from "../../CustomizeApp/PickerColor";
import { ImageIcon } from "../../../../../assets/POS/Image";
import { PickerPhoto } from "../../CustomizeApp/PickerPhoto";
import { AppContext } from "../../../Context/AppContext";
import { uploadImage } from "../../Cloudinary/Cloudinary";
import { updateBusiness } from "./Petitions";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";

export const CustomizeApp: React.FC<{ navigation: any }> = ({ navigation }) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [color, setColor] = useState("#6D01D1");
  const [isVisible, setIsVisible] = useState(false);
  const [urlPhoto, setUrlPhoto] = useState(context.store.Logo);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBig, setIsLoadingBig] = useState(false);
  const ommited = useCallback(async () => {
    try {
      setIsLoadingBig(true);
      let business = { Color: color, Logo: urlPhoto };
      if (urlPhoto && urlPhoto !== "error") {
        const uriPhoto = await uploadImage(urlPhoto);
        business = { ...business, Logo: uriPhoto };
        const data = await updateBusiness(
          context.user.Token,
          context.user.Business_Id + "",
          business
        );
        if (data) {
          context.setStore({ ...context.store, Logo: uriPhoto, Color: color });
          navigate(-1);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingBig(false);
    }
  }, [color, urlPhoto, context, navigation]);

  const handleImagePick = useCallback(async () => {
    setIsLoading(true);
    const url = await PickerPhoto();
    setUrlPhoto(url);
    setIsLoading(false);
  }, []);

  return (
    <div>
      <div
        className="flex items-center px-4 py-2 rounded-b-2xl"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
        onClick={() => {
          context.setShowNavBarBottom(true);
          navigate(-1);
        }}
      >
        <button className="mr-2">
          <ChevronBack width={30} height={30} />
        </button>
        <h1 className="text-lg font-bold text-white">Personalización</h1>
      </div>
      <div className="flex flex-col items-center min-h-screen bg-white">
        {/*<div
        className="w-full"
        style={{
          height: 50,
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      />*/}
        <div className="w-full flex flex-col items-center bg-white py-4">
          <h1 className="text-xl font-bold text-secondary">Indica tu estilo</h1>
          <p className="text-base text-gray-600">
            Para un ticket y catálogo profesional
          </p>
        </div>

        {/* Botón para agregar logo */}
        <button
          className="flex items-center justify-center bg-white shadow-md rounded-lg px-4 py-2 "
          onClick={handleImagePick}
        >
          <ImageIcon />
          <span className="text-primary ml-2">
            {urlPhoto && urlPhoto !== "error"
              ? "Cambiar logo"
              : "Agrega tu logo"}
          </span>
        </button>

        {/* Vista de muestra */}
        <div className="flex justify-around items-center bg-white w-[90%] h-[350px]  rounded-lg shadow-md">
          <div className="w-[45%] flex flex-col items-center bg-white rounded-lg shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loader border-t-4 border-primary"></div>
              </div>
            ) : urlPhoto && urlPhoto !== "error" ? (
              <img src={urlPhoto} className="w-20 h-20 rounded-lg mt-4" />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg mt-4" />
            )}
            <div className="flex flex-col mt-4 p-2">
              <div className="w-12 h-2 bg-gray-200 rounded"></div>
              <div className="w-12 h-2 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>

          <div className="p-2 w-[45%] flex flex-col items-center bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-around w-full mt-4">
              <div className="w-12 h-2 bg-gray-200 rounded"></div>
              <div className="w-12 h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="w-[80%] h-6 bg-gray-200 rounded mt-4"></div>
            <div className="w-[80%] h-6 bg-gray-200 rounded mt-4"></div>
            <div className="w-[40%] h-4 bg-gray-200 rounded mt-4"></div>
            <div
              className="w-[90%] h-4 mt-4 rounded"
              style={{ backgroundColor: color }}
            ></div>
          </div>
        </div>

        {/* Selector de color */}
        <button
          className="flex items-center justify-around bg-white rounded-lg w-[40%] h-10 mt-6"
          onClick={() =>{
            
            setIsVisible(!isVisible)
            
          }}
        >
          <span className="text-primary">Color:</span>
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: color }}
          ></div>
        </button>
        <PickerColor
          colorSelected={color}
          setColorSelected={setColor}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
        />

        {/* Botón de guardar */}
        {!isVisible && (
          <div className="fixed bottom-0 bg-white w-full py-4 flex justify-center">
            <button
              className="w-[80%] py-3 text-lg font-semibold text-white rounded-lg"
              style={{
                backgroundColor:
                  urlPhoto === "error" || !urlPhoto ? "#CCCCCC" : color,
              }}
              onClick={
                urlPhoto === "error" || urlPhoto === ""
                  ? handleImagePick
                  : ommited
              }
            >
              {urlPhoto === "error" || urlPhoto === ""
                ? "Elegir Imagen"
                : "Guardar"}
            </button>
          </div>
        )}

        {isLoadingBig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="loader border-t-4 border-secondary"></div>
          </div>
        )}
      </div>
    </div>
  );
};
