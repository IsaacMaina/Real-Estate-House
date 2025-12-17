// src/app/admin/blog/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaSave, FaTimes, FaPen } from 'react-icons/fa';

const EditBlogPost = () => {
  const params: { id?: string } = useParams();
  const id = params.id!;
  const router = useRouter();
  const [postData, setPostData] = useState({
    id: 0,
    title: '',
    excerpt: '',
    content: '',
    author: '',
    status: 'Draft',
    category: 'Market Trends',
    date: '',
    seoTitle: '',
    seoDescription: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await fetch(`/api/admin/blog/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPostData({
            id: parseInt(id),
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            author: data.author,
            status: data.status,
            category: data.category,
            date: data.date,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
          });
        } else {
          console.error('Failed to fetch blog post data');
          // Set default values
          setPostData({
            id: parseInt(id),
            title: '',
            excerpt: '',
            content: '',
            author: '',
            status: 'Draft',
            category: 'Market Trends',
            date: new Date().toISOString().split('T')[0],
            seoTitle: '',
            seoDescription: '',
          });
        }
      } catch (error) {
        console.error('Error fetching blog post data:', error);
        // Set default values
        setPostData({
          id: parseInt(id),
          title: '',
          excerpt: '',
          content: '',
          author: '',
          status: 'Draft',
          category: 'Market Trends',
          date: new Date().toISOString().split('T')[0],
          seoTitle: '',
          seoDescription: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPostData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        // Redirect back to blog management
        router.push('/admin/blog');
        router.refresh();
      } else {
        console.error('Failed to update blog post');
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
            <button
              onClick={() => router.push('/admin/blog')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={postData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={postData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={postData.author}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={postData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="Market Trends" className="text-gray-900">Market Trends</option>
                  <option value="Investment" className="text-gray-900">Investment</option>
                  <option value="Selling Tips" className="text-gray-900">Selling Tips</option>
                  <option value="Coastal Properties" className="text-gray-900">Coastal Properties</option>
                  <option value="Legal Guide" className="text-gray-900">Legal Guide</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={postData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="Draft" className="text-gray-900">Draft</option>
                  <option value="Published" className="text-gray-900">Published</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={postData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <FaPen className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">SEO Settings</h3>
                  <p className="text-sm text-gray-500">Optimize how this post appears in search engines</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    id="seoTitle"
                    name="seoTitle"
                    value={postData.seoTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                </div>
                
                <div>
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <input
                    type="text"
                    id="seoDescription"
                    name="seoDescription"
                    value={postData.seoDescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <FaSave className="mr-2" />
                Update Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBlogPost;