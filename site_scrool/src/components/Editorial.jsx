import { Link } from "react-router-dom";

function PhotoFrame({ src, alt }) {
  return (
    <div className="editorial-ph">
      <img src={src} alt={alt} className="editorial-img" loading="lazy" decoding="async" />
    </div>
  );
}

function PhotoCaption({ num, title, desc }) {
  return (
    <figcaption className="cap">
      <div className="l">
        <span className="num">{num}</span>
        <span className="ttl">{title}</span>
      </div>
      <p className="desc">{desc}</p>
    </figcaption>
  );
}

export default function Editorial({ data }) {
  const photos = data.photos || [];
  const pairs = [];
  for (let i = 0; i < photos.length; i += 2) {
    pairs.push(photos.slice(i, i + 2));
  }

  return (
    <section className="section editorial" id="about">
      <div className="wrap">
        <h2 className="display">{data.title}</h2>
        {data.features?.length > 0 && (
          <ul className="vrezka editorial-vrezka">
            {data.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <Link to={data.ctaLink} className="btn btn-solid editorial-cta">
          {data.ctaText}
        </Link>

      </div>
      <div className="editorial-split">
        {photos.map((photo) => (
          <figure key={photo.src} className="editorial-split-item">
            <PhotoFrame src={photo.src} alt={photo.title} />
            <PhotoCaption {...photo} />
          </figure>
        ))}
      </div>
    </section>
  );
}
