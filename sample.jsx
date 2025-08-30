import React from 'react';

const ReviewScreen = () => {
  const reviews = [
    {
      name: 'Excellent Audio Experience!',
      tag: 'Audio',
      rating: 5.0,
      text: 'The audio quality was fantastic! Really enjoyed the campaign and the whole experience was smooth.',
      date: '15 Aug, 2025 14:30 PM',
      campaign: 'Share Your Audio Experience',
      avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/4243136c10f9da024abc1e436b1d91a552d02aa9?width=200'
    },
    {
      name: 'Good Experience Overall',
      tag: 'Video',
      rating: 4.0,
      text: 'Great campaign concept, video quality was good. Would participate in similar campaigns again.',
      date: '14 Aug, 2025 16:20 PM',
      campaign: 'Product Demo Experience',
      avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/4243136c10f9da024abc1e436b1d91a552d02aa9?width=200'
    }
  ];

  return (
    <div className="flex-1 bg-ui-surface min-h-screen">
      {/* Header */}
      <div className="border-2 border-ui-borderEmphasis rounded-[20px] mx-6 mt-10 mb-6 bg-ui-surface shadow-elev0 flex items-center justify-between px-[39px] py-[22px]">
        <div className="flex items-center gap-[26px]">
          <div className="w-[50px] h-[50px] rounded bg-ui-surface flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-brand-blue">
              <path d="M12 20l-7 3 2-7-5-5 7-1 3-6 3 6 7 1-5 5 2 7-7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="font-poppins font-medium text-2xl text-text-default">Reviews</h1>
            <p className="font-poppins text-base text-text-muted">View and manage customer reviews and feedback.</p>
          </div>
        </div>
        <button className="h-[39px] px-[29px] rounded-[7px] bg-brand-blue text-text-inverse font-poppins font-semibold hover:bg-brand-blueBright transition-colors">
          Create New
        </button>
      </div>

      {/* Tabs Card */}
      <div className="mx-6 mb-6">
        <div className="relative w-full rounded-[20px] bg-ui-surface shadow-elev0 border border-ui-border">
          <div className="flex justify-center items-center gap-[350px] px-[151px] py-[15px]">
            <div className="relative font-poppins text-base text-text-default">
              My Reviews
              <div className="absolute -bottom-[20px] left-1/2 -translate-x-1/2 w-[191px] h-[7px] bg-brand-blue rounded-[100px]" />
            </div>
            <div className="font-poppins text-base text-text-subtle">All Reviews</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="mx-6 pb-10 flex flex-col gap-4">
        {reviews.map((review, index) => (
          <div key={index} className="flex gap-5 p-6 rounded-[10px] border border-ui-border bg-ui-surface shadow-elev1 w-full">
            <img src={review.avatar} alt="Customer" className="w-24 h-24 rounded-[10px] object-cover" />
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-manrope font-semibold text-text-muted">{review.name}</h3>
                <div
                  className={`py-1 px-5 rounded-full text-xs font-semibold font-manrope ${
                    review.tag === 'Audio'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {review.tag}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill={i < Math.round(review.rating) ? '#FFD700' : '#E5E5E5'}
                    >
                      <path d="M8 12.5l-4.5 2.5 1-5L0 6.5l5-.5L8 1l2.5 5 5 .5-4.5 3.5 1 5z" />
                    </svg>
                  ))}
                </div>
                <span className="font-semibold text-sm font-inter text-text-default">
                  {review.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-text-muted font-inter leading-snug">{review.text}</p>
              <div className="flex gap-10">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold font-manrope text-text-muted uppercase">Reviewed on</span>
                  <span className="text-xs font-semibold font-inter text-text-default">{review.date}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold font-manrope text-text-muted uppercase">Campaign</span>
                  <span className="text-xs font-semibold font-inter text-text-default">{review.campaign}</span>
                </div>
              </div>
            </div>
            <button className="text-text-subtle hover:bg-gray-100 p-2 rounded-md">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 15C11.3807 15 12.5 13.8807 12.5 12.5C12.5 11.1193 11.3807 10 10 10C8.61929 10 7.5 11.1193 7.5 12.5C7.5 13.8807 8.61929 15 10 15Z" fill="currentColor" />
                <path d="M10 8C11.3807 8 12.5 6.88071 12.5 5.5C12.5 4.11929 11.3807 3 10 3C8.61929 3 7.5 4.11929 7.5 5.5C7.5 6.88071 8.61929 8 10 8Z" fill="currentColor" />
                <path d="M10 22C11.3807 22 12.5 20.8807 12.5 19.5C12.5 18.1193 11.3807 17 10 17C8.61929 17 7.5 18.1193 7.5 19.5C7.5 20.8807 8.61929 22 10 22Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        ))}
        <div className="text-center py-10">
          <p className="text-sm text-text-muted">You have received {reviews.length} reviews so far</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewScreen;
