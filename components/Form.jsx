import Link from "next/link";
import dynamic from 'next/dynamic';

const TrailMap = dynamic(() => import('./TrailMap'), {
    ssr: false,
    loading: () => <p>Loading map...</p>
});

const Form = ({ type, post, setPost, submitting, handleSubmit }) => {
  const handlePathChange = (pathGeoJSON) => {
    console.log("Path changed in Form:", pathGeoJSON);
    if (pathGeoJSON && Array.isArray(pathGeoJSON.coordinates) && pathGeoJSON.coordinates.length > 0) {
      console.log("Setting valid path:", pathGeoJSON);
      setPost({ ...post, trailPath: pathGeoJSON });
    } else if (post.trailPath && Array.isArray(post.trailPath.coordinates) && post.trailPath.coordinates.length > 0) {
      console.log("Keeping existing path:", post.trailPath);
    } else {
      console.log("Invalid or empty path received");
    }
  };

  const handleSubmitWithValidation = (e) => {
    e.preventDefault();
    
    // Validate trail path before submission
    if (!post.trailPath || !Array.isArray(post.trailPath.coordinates) || post.trailPath.coordinates.length === 0) {
      alert("Please draw a valid trail path on the map");
      return;
    }
    
    console.log("Submitting with trail path:", post.trailPath);
    handleSubmit(e);
  };

  return (
    <section className='w-full max-w-full flex-start flex-col'>
      <h1 className='head_text text-left'>
        <span className='blue_gradient'>{type} Trail</span>
      </h1>
      <p className='desc text-left max-w-md'>
        {type} and share amazing hiking trails with the world, and let others explore nature through your experiences.
      </p>

      <form
        onSubmit={handleSubmitWithValidation}
        className='mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism'
      >
        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Trail Name
          </span>
          <input
            value={post.name}
            onChange={(e) => setPost({ ...post, name: e.target.value })}
            placeholder='Write your trail name here...'
            required
            className='form_input'
          />
        </label>

        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Difficulty
          </span>
          <select
            value={post.difficulty}
            onChange={(e) => setPost({ ...post, difficulty: e.target.value })}
            required
            className='form_input'
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Location
          </span>
          <input
            value={post.location}
            onChange={(e) => setPost({ ...post, location: e.target.value })}
            placeholder='Where is this trail located?'
            required
            className='form_input'
          />
        </label>

        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Draw Trail Path
          </span>
          <div className="mt-2">
            <TrailMap onPathChange={handlePathChange} existingPath={post.trailPath} />
          </div>
        </label>

        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Description
          </span>
          <textarea
            value={post.description}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            placeholder='Write your trail description here...'
            required
            className='form_textarea'
          />
        </label>

        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Tag {` `}
            <span className='font-normal'>(woodland, mountain, lake)</span>
          </span>
          <input
            value={post.tag}
            onChange={(e) => setPost({ ...post, tag: e.target.value })}
            placeholder='#tag'
            required
            className='form_input'
          />
        </label>

        <div className='flex-end mx-3 mb-5 gap-4'>
          <Link href='/' className='text-gray-500 text-sm'>
            Cancel
          </Link>

          <button
            type='submit'
            disabled={submitting}
            className='px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white'
          >
            {submitting ? `Creating...` : type}
          </button>
        </div>

      </form>
    </section>
  );
};
//`${type}...` - can write this in place of 'Creating...'
export default Form;