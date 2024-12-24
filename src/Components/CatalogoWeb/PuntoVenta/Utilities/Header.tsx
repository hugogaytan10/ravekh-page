import React, { useContext } from "react";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { ThemeLight } from "../Theme/Theme";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";


interface HeaderProps {
  screenName: string;
  navigation: any;
}

export const Header: React.FC<HeaderProps> = ({ screenName, navigation }) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center px-4 py-2 rounded-b-2xl"
      style={{ backgroundColor: context.store.Color || ThemeLight.btnBackground }}
      onClick={() => navigate(-1)}
    >
      <button className="mr-2">
        <ChevronBack width={30} height={30}/>
      </button>
      <h1 className="text-lg font-bold text-white">{screenName}</h1>
    </div>
  );
};
