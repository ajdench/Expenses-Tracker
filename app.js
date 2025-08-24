// Main app logic
document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  await renderTrips();
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}
