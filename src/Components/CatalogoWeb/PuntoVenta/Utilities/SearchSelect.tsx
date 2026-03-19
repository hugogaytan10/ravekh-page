import React, { useEffect, useMemo, useRef, useState } from "react";


type BaseSelectItem = {
  Id: string | number;
  Name?: string;
  [key: string]: any;
};

type SearchSelectProps<T extends BaseSelectItem> = {
  dataSelect: T[];
  setGruop: React.Dispatch<React.SetStateAction<T | null>> | ((item: T) => void);
  labelSelect: string;
  labelSeach: string;
  update?: boolean;
  className?: string;
};

export const SearchSelect = <T extends BaseSelectItem>({
  dataSelect,
  setGruop,
  labelSelect,
  labelSeach,
  update = false,
  className = "",
}: SearchSelectProps<T>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelectedItem(null);
    setSearch("");
    setIsOpen(false);
  }, [labelSelect, dataSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return dataSelect;

    return dataSelect.filter((item) =>
      String(item.Name || "")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [dataSelect, search]);

  const handleSelect = (item: T) => {
    setSelectedItem(item);
    setGruop(item);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className || (update ? "w-full" : "w-[80%]")}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-center rounded border border-[#B4B4B4] bg-white px-3"
      >
        <span className="flex-1 truncate text-center font-medium text-[18px] text-[#BEBEBE]">
          {selectedItem?.Name || labelSelect}
        </span>

        <div
          className={`ml-2 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-lg border border-[#D7DDE3] bg-[#E9ECEF] shadow-lg">
          <div className="border-b border-[#B1BDC8] bg-[#E9ECEF] p-2">
            <div className="flex items-center rounded-lg border-b border-[#B1BDC8] bg-[#E9ECEF] px-3">
              <div className="mr-2 flex shrink-0 items-center">
              </div>

              <input
                type="text"
                value={search}
                placeholder={labelSeach}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full bg-transparent text-[16px] text-[#151E26] outline-none placeholder:text-[#72808D]"
              />
            </div>
          </div>

          <div className="max-h-[220px] overflow-y-auto">
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const isSelected =
                  selectedItem?.Id != null && selectedItem.Id === item.Id;

                return (
                  <button
                    key={item.Id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`flex w-full items-center justify-center border-b border-[#B1BDC8] px-3 py-3 text-center transition-colors ${
                      isSelected ? "bg-[#D2D9DF]" : "bg-transparent"
                    } hover:bg-[#DCE2E8]`}
                  >
                    <span className="flex-1 text-center font-medium text-[18px] text-[#151E26]">
                      {item.Name || ""}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-sm text-[#72808D]">
                Sin resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};