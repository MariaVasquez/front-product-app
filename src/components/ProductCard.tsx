import { Link } from 'react-router-dom';

interface ProductCardProps {
  id:number;
  title: string;
  price: string;
  imageUrl: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  imageUrl,
}) => {
  
  return (
    <div className="text-left">
      <Link to={`/products/${title.replace(/\s+/g, '-')}`} state={{ id: id}}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto object-cover rounded-md hover:opacity-90 transition duration-300"
        />
      </Link>
      <Link
        to={`/products/${title.replace(/\s+/g, '-')}` } state={{ id: id}}
        className="mt-2 inline-block text-sm text-gray-800 uppercase tracking-wide relative
                   after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-black 
                   hover:after:w-full after:transition-all after:duration-300"
      >
        {title}
      </Link>

      <p className="text-lg font-light text-gray-900 mt-1">{price}</p>
    </div>
  );
};
