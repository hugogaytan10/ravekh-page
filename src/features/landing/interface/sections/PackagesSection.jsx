import { landingPackages } from "../../model/packages";
import "../styles/landingVisuals.css";

export const PackagesSection = () => {
  return (
    <div className="w-full min-h-screen py-10">
      <div className="landing-packages-container">
        <div className="flex gap-6 flex-wrap">
          {landingPackages.map((landingPackage) => (
            <article key={landingPackage.packageName} className="landing-package-card w-full md:w-[31%]">
              <header className="bg-[#6D01D1] text-white min-h-20 text-2xl font-bold p-4 rounded-t-[10px]">
                {landingPackage.packageName}
              </header>
              <p className="text-4xl font-bold m-5 text-[#6D01D1]">
                {landingPackage.price}
                <span className="block text-xs text-gray-500">IVA INCLUIDO</span>
              </p>
              <div className="mx-8 mb-10 text-sm leading-8">
                {landingPackage.description.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
