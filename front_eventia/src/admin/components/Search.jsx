import React from 'react';
import { FaSearch } from 'react-icons/fa';

const Search = ({ search, setSearch, placeholder = "Recherche..." }) => {
  return (
    <div className="form-search-wrapper me-3">
      <form onSubmit={(e) => e.preventDefault()} className="mb-0">
        <div className="position-relative" style={{ width: "250px" }}>
          <FaSearch
            style={{
              position: 'absolute',
              top: '50%',
              left: '10px',
              transform: 'translateY(-50%)',
              color: '#aaa',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            className="form-control ps-5 rounded-0"
          />
        </div>
      </form>
    </div>
  );
};

export default Search;
