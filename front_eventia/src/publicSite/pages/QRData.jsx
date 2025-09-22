import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqData = [
  {
    question: "Comment créer un compte sur EventIA ?",
    answer: "Cliquez sur 'S'inscrire', remplissez vos informations avec un valide email et validez votre inscription pour accéder à votre compte.",
  },
    {
    question: "Comment puis-je découvrir les événements près de chez moi ?",
    answer: "Connectez à votre compte puis utilisez la barre de recherche ou les filtres sur la page d'événements pour trouver les événements selon votre ville, vos centres d’intérêt ou la date.",
  },
  {
    question: "Puis-je réserver plusieurs billets pour un même événement ?",
    answer: "Oui, vous pouvez réserver entre 1 et 3 billets par événement directement depuis la page de réservation.",
  },
  {
    question: "Comment recevoir mes billets après réservation ?",
    answer: "Une fois la réservation confirmée et payée, vos billets sont disponibles au format PDF dans votre dashboard et envoyés par email.",
  },
  {
    question: "Puis-je annuler ou modifier ma réservation ?",
    answer: "Vous pouvez annuler ou modifier vos réservations depuis votre panier avant la date limite indiquée pour chaque événement.",
  },
  {
    question: "Puis-je organiser mon propre événement ?",
    answer: "Oui. Créez un compte organisateur, connectez-vous à votre dashboard et cliquez sur 'Créer un événement' et l'événement sera validée après par notre administrateur et être visible au public.",
  },
  {
    question: "Comment contacter le support EventIA ?",
    answer: "Utilisez notre formulaire de contact sur la page 'Contact' ou écrivez à eventia.gha@gmail.com.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h6 className="section-title text-primary px-3">FAQ</h6>
          <h1 className="mb-3">Questions fréquentes</h1>
          <p className="text-muted">
            Retrouvez ici les réponses aux questions les plus courantes concernant EventIA.
          </p>
        </div>
        <div className="faq-list">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="faq-item mb-3 border rounded shadow-sm overflow-hidden"
              style={{ transition: "all 0.3s" }}
            >
              {/* Question */}
              <div
                className="faq-question d-flex justify-content-between align-items-center p-4"
                style={{
                  cursor: "pointer",
                  backgroundColor: activeIndex === index ? "#e3f2fd" : "#f8f9fa",
                  transition: "background-color 0.3s",
                }}
                onClick={() => toggleFAQ(index)}
              >
                <h5 className="mb-0">{item.question}</h5>
                <span className="faq-icon">
                  {activeIndex === index ? (
                    <FaChevronUp size={18} />
                  ) : (
                    <FaChevronDown size={18} />
                  )}
                </span>
              </div>

              {/* Answer */}
              <div
                className="faq-answer px-4"
                style={{
                  maxHeight: activeIndex === index ? "200px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                  backgroundColor: "#ffffff",
                }}
              >
                {activeIndex === index && (
                  <p className="py-3 text-muted mb-0">{item.answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
