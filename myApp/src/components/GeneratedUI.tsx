import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";

interface UILayout {
  type?: string;
  sections?: {
    header?: string;
    components?: { type?: string; title?: string; content?: string }[];
  }[];
}

const GeneratedUI: React.FC<{ layout: UILayout | null }> = ({ layout }) => {
  if (!layout) return <p>Loading resources...</p>;

  // Defensive check
  if (!layout.sections || layout.sections.length === 0) {
    console.warn("⚠️ Layout missing or empty:", layout);
    return <p>No sections available to display.</p>;
  }

  return (
    <div>
      {layout.sections.map((section, idx) => (
        <div key={idx}>
          <h2 style={{ marginTop: "1rem", color: "#3a2c4a" }}>
            {section.header || "Untitled Section"}
          </h2>
          {section.components?.map((comp, i) => (
            <IonCard key={i}>
              <IonCardHeader>
                <IonCardTitle>{comp.title || "Untitled"}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {comp.content || "No content available."}
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GeneratedUI;
