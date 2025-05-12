document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("bookings-body");
    const pagination = document.getElementById("pagination-controls");
    const bookingsPerPage = 10;
    let bookings = [];
  
    function renderPage(page = 1) {
      const start = (page - 1) * bookingsPerPage;
      const end = start + bookingsPerPage;
      const pageItems = bookings.slice(start, end);
  
      tbody.innerHTML = "";
      if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No bookings found.</td></tr>`;
        return;
      }
  
      pageItems.forEach(b => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><strong>${b.pnr}</strong></td>
          <td>${b.firstName} ${b.lastName}</td>
          <td>${b.email}</td>
          <td>${b.phone}</td>
          <td>${b.origin} → ${b.destination}</td>
          <td>${new Date(b.departureDate).toLocaleDateString()}</td>
          <td>${b.returnDate ? new Date(b.returnDate).toLocaleDateString() : "-"}</td>
          <td>${b.price} ${b.currency}</td>
          <td>${new Date(b.createdAt).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
      });
  
      renderPagination(page);
    }
  
    function renderPagination(currentPage) {
      const totalPages = Math.ceil(bookings.length / bookingsPerPage);
      if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
      }
  
      pagination.innerHTML = "";
  
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"} mx-1`;
        btn.textContent = i;
        btn.addEventListener("click", () => renderPage(i));
        pagination.appendChild(btn);
      }
    }
  
    try {
      const res = await fetch("/api/bookings");
      bookings = await res.json();
      renderPage(1);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      tbody.innerHTML = `<tr><td colspan="9" class="text-danger text-center">Failed to load bookings</td></tr>`;
    }
  });
  