// Get elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapButton = document.getElementById('snap');
const saveButton = document.getElementById('save');
const queryButton = document.getElementById('query');
const photo = document.getElementById('photo');
const exportButton = document.getElementById('export');

let db;

// Open IndexedDB
const request = indexedDB.open('PhotoDB', 1);

request.onupgradeneeded = event => {
  db = event.target.result;
  const objectStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
  objectStore.createIndex('timestamp', 'timestamp', { unique: false });
  objectStore.createIndex('description', 'description', { unique: false });
};

request.onsuccess = event => {
  db = event.target.result;
};

request.onerror = event => {
  console.error('IndexedDB error: ', event.target.errorCode);
};

// Access the camera
navigator.mediaDevices
  .getUserMedia({ video: { facingMode: 'environment' } })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error('Error accessing the camera: ', err);
  });

// Capture photo
snapButton.addEventListener('click', () => {
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
});

// Save photo and metadata to IndexedDB and display it
saveButton.addEventListener('click', () => {
  canvas.toBlob(blob => {
    const transaction = db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');

    const photoData = {
      timestamp: new Date().toISOString(),
      description: 'Sample photo description',
      image: blob
    };

    const addRequest = store.add(photoData);

    addRequest.onsuccess = event => {
      const key = event.target.result;

      // Fetch the image and metadata from the database
      const getRequest = store.get(key);

      getRequest.onsuccess = event => {
        const savedData = event.target.result;
        const url = URL.createObjectURL(savedData.image);
        photo.src = url;

        console.log('Timestamp:', savedData.timestamp);
        console.log('Description:', savedData.description);
      };

      getRequest.onerror = event => {
        console.error('Error fetching saved image: ', event.target.errorCode);
      };
    };

    addRequest.onerror = event => {
      console.error('Error saving image: ', event.target.errorCode);
    };
  }, 'image/png');
});

// Query photos by timestamp
queryButton.addEventListener('click', () => {
  const transaction = db.transaction(['photos'], 'readonly');
  const store = transaction.objectStore('photos');
  const index = store.index('timestamp');

  // Change to your desired start date and end date
  const lowerBound = new Date('2024-07-18T14:31:56.851Z').toISOString(); // Change to your desired start date
  const upperBound = new Date('2024-07-18T14:32:25.274Z').toISOString(); // Change to your desired end date

  const range = IDBKeyRange.bound(lowerBound, upperBound);

  index.openCursor(range).onsuccess = event => {
    const cursor = event.target.result;
    if (cursor) {
      const savedData = cursor.value;
      const url = URL.createObjectURL(savedData.image);
      photo.src = url;

      console.log('Timestamp:', savedData.timestamp);
      console.log('Description:', savedData.description);

      cursor.continue();
    }
  };
});

function exportDatabase() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['photos'], 'readonly');
    const store = transaction.objectStore('photos');
    const exportData = [];

    store.openCursor().onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const savedData = cursor.value;
        exportData.push(synthesizeData(savedData));
        cursor.continue();
      } else {
        resolve(exportData);
      }
    };

    transaction.oncomplete = function () {
      // This will be called when the transaction is complete
      console.log('Transaction completed.');
    };

    transaction.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

async function synthesizeData(dataToResolve) {
    return {
      id: dataToResolve.id,
      timestamp: dataToResolve.timestamp,
      description: dataToResolve.description,
      image: await blobToBase64(dataToResolve.image)
    };
}

function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

exportButton.addEventListener('click', async () => {
  try {
    const exportData = await exportDatabase();
    const data = await Promise.all(exportData);
    console.log(data[data.length - 1].image);
    const jsonString = JSON.stringify(data, null, 2);
    downloadJSON(jsonString, 'photoDB_export.json');
  } catch (error) {
    console.error('Error exporting database:', error);
  }
});

function downloadJSON(data, filename) {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

(async () => {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    console.log(`Persisted storage granted: ${isPersisted} (checked)`);
  }

  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Persisted storage granted: ${isPersisted} (requested)`);
  }

  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    console.log('Storage estimate:', estimate.quota - estimate.usage);
  }
})();
