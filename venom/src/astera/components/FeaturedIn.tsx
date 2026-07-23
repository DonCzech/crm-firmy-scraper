export default function FeaturedIn() {
  const brands = [
    "Česká televize",
    "Forbes Česko",
    "Seznam Zprávy",
    "Radiožurnál",
    "iDNES.cz",
    "DVTV",
    "Elle Czech",
    "Ženy.cz",
  ];

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "60px 0" }}>
      <div className="container-main">
        <h2
          style={{
            textAlign: "center",
            marginBottom: "40px",
            marginTop: 0,
          }}
        >
          Objevilo se v médiích
        </h2>

        <div className="featured-grid" aria-label="České firmy a značky">
          {brands.map((brand) => (
            <div className="featured-brand" key={brand}>
              {brand}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          align-items: stretch;
        }
        .featured-brand {
          min-height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 18px;
          border: 1px solid #e6e1ea;
          border-radius: 8px;
          background: #fff;
          color: #31233d;
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0;
          text-align: center;
          box-shadow: 0 12px 28px rgba(76, 54, 92, 0.06);
        }
        @media (max-width: 900px) {
          .featured-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .featured-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
