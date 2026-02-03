import React, { useState, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeLight } from "../Theme/Theme";
import { PickerColor } from "../CustomizeApp/PickerColor";
import { ImageIcon } from "../../../../assets/POS/Image";
import { PickerPhoto } from "../CustomizeApp/PickerPhoto";
import { AppContext } from "../../Context/AppContext";
import { uploadImage } from "../Cloudinary/Cloudinary";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { signUpToServer } from "./Peticiones";

export const InitialCustomizeApp: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const [color, setColor] = useState("#6D01D1");
  const [isVisible, setIsVisible] = useState(false);
  const [urlPhoto, setUrlPhoto] = useState(context.store.Logo);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBig, setIsLoadingBig] = useState(false);

  // ✅ NUEVOS CAMPOS
  const [businessName, setBusinessName] = useState<string>(
    (context.store as any)?.Name || ""
  );
  const [phone, setPhone] = useState<string>(
    (context.store as any)?.Phone || ""
  );
  const [address, setAddress] = useState<string>(
    (context.store as any)?.Address || ""
  );
  const [references, setReferences] = useState<string>(
    (context.store as any)?.References || ""
  );

  const [errors, setErrors] = useState<{
    businessName?: string;
    phone?: string;
    address?: string;
    references?: string;
  }>({});

  const validate = useCallback(() => {
    const newErrors: typeof errors = {};

    const bn = businessName.trim();
    const ph = phone.trim();
    const ad = address.trim();
    const rf = references.trim();

    if (!bn) newErrors.businessName = "El nombre del negocio es obligatorio.";
    if (!ph) newErrors.phone = "El número de teléfono es obligatorio.";
    if (!ad) newErrors.address = "La dirección es obligatoria.";
    if (!rf) newErrors.references = "Las referencias son obligatorias.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [businessName, phone, address, references]);

  const canSave = useMemo(() => {
    return (
      businessName.trim() &&
      phone.trim() &&
      address.trim() &&
      references.trim() &&
      urlPhoto &&
      urlPhoto !== "error"
    );
  }, [businessName, phone, address, references, urlPhoto]);

  const ommited = useCallback(async () => {
    // ✅ no guardar si falta algo
    if (!validate()) return;

    try {
      setIsLoadingBig(true);

      let business: any = {
        Color: color,
        Logo: urlPhoto,
        Name: businessName.trim(),
        PhoneNumber: phone.trim(),
        Address: address.trim(),
        References: references.trim(),
      };

      if (urlPhoto && urlPhoto !== "error") {
        const uriPhoto = await uploadImage(urlPhoto);
        business = { ...business, Logo: uriPhoto };

        // ✅ si tu backend ya toma los datos desde context.store,
        // actualizamos store antes de llamar signUpToServer:
        const updatedStore: any = {
          ...context.store,
          ...business,
          Logo: uriPhoto,
          Color: color,
        };

        console.log("updatedStore", updatedStore);

        const data = await signUpToServer(
          updatedStore,
          context.user,
          context.user.Token
        );

        if (data) {
          context.setStore(updatedStore);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingBig(false);
    }
  }, [
    color,
    urlPhoto,
    context,
    navigation,
    businessName,
    phone,
    address,
    references,
    validate,
    navigate,
  ]);

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
        {/* ✅ INPUTS (arriba de "Indica tu estilo") */}
        <div className="w-full flex flex-col items-center bg-white pt-6 pb-2">
          <div className="w-[90%] flex flex-col gap-3">
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Nombre del negocio"
                maxLength={60}
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (errors.businessName)
                    setErrors((prev) => ({ ...prev, businessName: undefined }));
                }}
                onBlur={validate}
                className="w-full p-3 border-b border-gray-300 rounded-md text-gray-700 bg-white"
              />
              {errors.businessName && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.businessName}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <input
                type="tel"
                placeholder="Número de teléfono"
                maxLength={20}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone)
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                onBlur={validate}
                className="w-full p-3 border-b border-gray-300 rounded-md text-gray-700 bg-white"
              />
              {errors.phone && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Dirección"
                maxLength={120}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address)
                    setErrors((prev) => ({ ...prev, address: undefined }));
                }}
                onBlur={validate}
                className="w-full p-3 border-b border-gray-300 rounded-md text-gray-700 bg-white"
              />
              {errors.address && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.address}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Referencias (ej. entre calles, colonia, etc.)"
                maxLength={160}
                value={references}
                onChange={(e) => {
                  setReferences(e.target.value);
                  if (errors.references)
                    setErrors((prev) => ({ ...prev, references: undefined }));
                }}
                onBlur={validate}
                className="w-full p-3 border-b border-gray-300 rounded-md text-gray-700 bg-white"
              />
              {errors.references && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.references}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
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
            {urlPhoto && urlPhoto !== "error" ? "Cambiar logo" : "Agrega tu logo"}
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
          onClick={() => {
            setIsVisible(!isVisible);
          }}
        >
          <span className="text-primary">Color:</span>
          <div className="w-8 h-8 rounded" style={{ backgroundColor: color }} />
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
                backgroundColor: canSave ? color : "#CCCCCC",
              }}
              onClick={() => {
                if (urlPhoto === "error" || !urlPhoto) {
                  handleImagePick();
                  return;
                }
                if (!canSave) {
                  validate();
                  return;
                }
                ommited();
              }}
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
