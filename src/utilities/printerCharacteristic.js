let printerCharacteristic = null;

export async function connectSavedPrinter() {
//   const deviceId = localStorage.getItem("printerDeviceId");
//   if (!deviceId) throw "Printer belum disetting";

  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
  });

  if (!device) throw "Printer tidak ditemukan";

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(
    "000018f0-0000-1000-8000-00805f9b34fb"
  );

  printerCharacteristic = await service.getCharacteristic(
    "00002af1-0000-1000-8000-00805f9b34fb"
  );
  return printerCharacteristic;
}
