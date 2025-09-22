import React, { useEffect, useState } from 'react';
import axios from '../config/axiosConfig'; 
import Swal from 'sweetalert2';
import { FaEdit, FaEye, FaTrashAlt, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import SearchUser from "./SearchUser";

const UserView = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("Tous");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await axios.get("/users");
      const filtered = result.data.filter(user => user.role !== 'ADMIN');
      setUsers(filtered);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de charger les utilisateurs.',
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/users/${id}`);
        Swal.fire('Supprimé !', 'L\'utilisateur a été supprimé.', 'success');
        loadUsers();
      } catch (error) {
        Swal.fire('Erreur!', 'Une erreur est survenue lors de la suppression.', 'error');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    (user.nom || '').toLowerCase().includes(search.toLowerCase()) &&
    (selectedRole === "Tous" || (user.role || '') === selectedRole)
  );

  const uniqueRoles = ["Tous", ...new Set(users.map(user => user.role || ''))];

  return (
    <div className="container" style={{ paddingTop: '80px' }}>
      <div className="page-inner">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0"> <i class="bi bi-people-fill text-success"></i> Les utilisateurs</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <Link to="/admin/">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Utilisateurs
              </li>
            </ol>
          </nav>
        </div>

        <section className="section">
          <div className="card card-full-width shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0">Liste des utilisateurs</h4>
              <Link to="/admin/add-users" className="btn btn-success rounded-pill">
                <FaPlus className="me-2" />
                Ajouter un organisateur
              </Link>
            </div>

            {/* Zone de recherche + filtre par rôle */}
            <div className="d-flex align-items-center px-4 mb-3 flex-wrap">
              {/* Composant de recherche */}
              <SearchUser search={search} setSearch={setSearch} />

              {/* Filtre par rôle */}
              <div className="d-flex align-items-center">
                <label className="me-2 fw-bold mb-0">Filtrer par rôle :</label>
                <select
                  className="form-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{ width: "200px" }}
                >
                  {uniqueRoles.map((role, index) => (
                    <option key={index} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-lg text-center">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr key={user.id}>
                          <th scope="row">{index + 1}</th>
                          <td>{user.typeOrganisateur === 'SOCIETE' ? (user.nomSociete || '--') : (user.nom || '--')}</td>
                          <td>{user.typeOrganisateur === 'SOCIETE' ? '--' : (user.prenom || '--')}</td>
                          <td>{user.email || '--'}</td>
                          <td>{user.role || '--'}</td>
                          <td>
                            <div className="d-flex justify-content-center">
                              <Link to={`/admin/users/view/${user.id}`} className="btn btn-info btn-sm mx-1" title="Voir">
                                <FaEye size="1.5em" />
                              </Link>
                              <Link to={`/admin/users/edit/${user.id}`} className="btn btn-warning btn-sm mx-1" title="Modifier">
                                <FaEdit size="1.5em" />
                              </Link>
                              <button className="btn btn-danger btn-sm mx-1" onClick={() => handleDelete(user.id)} title="Supprimer">
                                <FaTrashAlt size="1.5em" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">Aucun utilisateur trouvé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default UserView;
