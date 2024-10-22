import TrailCard from "./TrailCard"

const Profile = ({ name, desc, data, handleEdit, handleDelete }) => {
  return (
    <section className='w-full'>
      <h1 className='head_text text-left'>
        <span className='blue_gradient'>{name} Profile</span>
      </h1>
      <p className='desc text-left'>{desc}</p>
      {/*added trail_container */}
      <div className="trail_container">
        <div className='mt-10 trail_layout'>
          {data.length > 0 ? (
            data.map((post) => (
              <TrailCard
                key={post._id}
                post={post}
                handleEdit={() => handleEdit && handleEdit(post)}
                handleDelete={() => handleDelete && handleDelete(post)}
              />
            ))
          ) : (
            <p>No trails found. Start by creating a new trail!</p>
          )}
        </div>
      </div>
      
    </section>
  )
}

export default Profile