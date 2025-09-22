import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="position-relative w-75 mx-auto animated slideInDown">
      <input
        className="form-control border-0 rounded-pill w-100 py-3 ps-4 pe-5"
        type="text"
        placeholder="Rechercher par titre ou adresse..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        type="button"
        className="btn btn-primary rounded-pill py-2 px-4 position-absolute top-0 end-0 me-2"
        style={{ marginTop: 7 }}
        onClick={handleSearch}
      >
        Rechercher
      </button>
    </div>
  );
}
