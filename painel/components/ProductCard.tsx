'use client';

interface ProductCardProps {
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  whatsappNumber: string;
}

export default function ProductCard({ name, price, description, image, whatsappNumber }: ProductCardProps) {
  const formattedPrice = price.toFixed(2).replace('.', ',');
  const whatsappText = encodeURIComponent(`Olá! Quero comprar: ${name} - R$ ${formattedPrice}`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-rose-100/60 transition-all duration-500 border border-rose-50/80 hover:border-rose-200/60 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          <span className="text-sm font-bold text-rose-600">R$ {formattedPrice}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-800 text-[15px] leading-tight mb-1.5 line-clamp-2">
          {name}
        </h3>
        {description && (
          <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>
        )}
        {!description && <div className="mb-4" />}

        {/* WhatsApp button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-200/50 hover:shadow-lg hover:shadow-emerald-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.01.79.8-2.93-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
          Comprar no WhatsApp
        </a>
      </div>
    </div>
  );
}
