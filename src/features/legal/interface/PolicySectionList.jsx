import React from "react";

export const PolicySectionList = ({ sections }) => {
  return sections.map((section) => (
    <section className="mb-6" key={section.heading}>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">{section.heading}</h2>

      {section.paragraphs?.map((paragraph) => (
        <p
          className={`text-gray-600 leading-relaxed${section.emphasis ? " font-semibold" : ""}`}
          key={paragraph}
        >
          {paragraph}
        </p>
      ))}

      {section.bullets?.length ? (
        <ul className="list-disc list-inside text-gray-600 mt-4">
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </section>
  ));
};
