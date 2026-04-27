// Initialize MongoDB replica set
// Bu script MongoDB container başlatıldığında otomatik çalışır

if (rs.status().ok === 0) {
  // Replica set henüz initialize edilmemiş, initialize et
  rs.initiate({
    _id: 'rs0',
    members: [{ _id: 0, host: 'mongo:27017' }]
  });
  print('Replica set rs0 initialize edildi');
} else {
  print('Replica set zaten initialize edilmiş');
}
