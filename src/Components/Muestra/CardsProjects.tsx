import React from "react";
interface ICards {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
}
export const CardsProjects: React.FC<ICards> = ({ title, description, imageUrl, link }) => {

    return (
        <div className="w-full min-h-fit  md:w-full lg:w-full bg-fondo rounded-lg mt-4 mb-4 bg-white border-2 border-gray-100 hover:shadow-md overflow-hidden"
        >
            <div className="min-h-fit max-h-64 overflow-hidden">
                <img src={imageUrl} alt={title} className='w-100% h-full object-contain rounded-lg transition-all hover:scale-110' />
            </div>
            <div className="h-fit flex flex-wrap justify-center  mt-2 overflow-auto">
                <h2 className="text-xl font-bold text-gray-800 text-center md:text-2xl ">
                    {title}
                </h2>

                <div className="card-description text-gray-500 text-lg text-justify overflow-auto p-3">
                    {description}
                </div>

                <div className="w-full  flex justify-end items-center">
                    {link !== "" && <a href={link} target={"_blank"} className='text-xl text-purple-800  text-center border-b-2 m-2 border-purple-800'>Ir a</a>}
                </div>
            </div>
        </div>
    );
}