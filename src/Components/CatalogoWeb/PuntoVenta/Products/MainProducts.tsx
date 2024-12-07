import React, { useContext, useState } from "react";
import { ThemeLight } from "../Theme/Theme";
import Search from "../../../../assets/POS/Search";
import ScanIcon from "../../../../assets/POS/ScanCircleIcon";
import {Settings} from "../../../../assets/POS/Settings";
import { List } from "./CRUDProducts/List";
import {AppContext } from "../../Context/AppContext";
export const MainProducts: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [barCode, setBarCode] = useState("");
  const [isShow, setIsShow] = useState(false);
  const context = useContext(AppContext);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 ">
      {/* Header */}
      <header
        className="py-2 text-white flex items-center justify-center"
        style={{
          backgroundColor: context.store.Color || ThemeLight.btnBackground,
        }}
      >
        <h1 className="text-lg font-semibold">{context.store.Name}</h1>
      </header>

      {/* Icons Section */}
      <div className="flex justify-between items-center px-4 py-2 bg-white shadow">
        {/* Search Icon */}
        <button
          className="bg-gray-100 p-2 rounded-full flex items-center justify-center"
          onClick={() => navigation.navigate("SearchProductScreen")}
        >
          <Search width={25} height={25} />
        </button>

        {/* Scan and Filter Icons */}
        <div className="flex space-x-4">
          <button
            className="bg-gray-100 p-2 rounded-full flex items-center justify-center w-12 h-12"
            onClick={() => setIsShow(true)}
          >
            <ScanIcon width={40} height={40} />
          </button>
          <button
            className="bg-gray-100 p-2 rounded-full flex items-center justify-center w-12 h-12"
            onClick={() => navigation.navigate("Filter")}
          >
            <Settings  />
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="flex-grow ">
        <List navigation={navigation} barCode={barCode} />
      </div>

     
    </div>
  );
};

