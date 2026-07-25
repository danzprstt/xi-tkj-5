// Catatan: ini proteksi tingkat "deterrent" (bikin repot orang awam),
// BUKAN enkripsi/DRM sungguhan — siapapun yang cukup paham DevTools tetap
// bisa mengambil gambar. Tujuannya cuma mencegah cara paling umum: klik
// kanan > Simpan Gambar, drag-drop ke desktop, dan tahan-lama di HP.
export default function ProtectedImage({ src, alt, className, style, onError, loading }) {
  return (
    <span className={'protected-img-wrap' + (className ? ' ' + className : '')} style={style}>
      <img
        src={src}
        alt={alt || ''}
        loading={loading}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onError={onError}
      />
      {/* Lapisan transparan di atas gambar — supaya klik kanan/tahan-lama
          "mengenai" elemen ini, bukan elemen <img> yang sebenarnya. */}
      <span className="protected-img-shield" onContextMenu={(e) => e.preventDefault()} />
    </span>
  );
}
