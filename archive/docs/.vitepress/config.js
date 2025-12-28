import { defineConfig } from 'vitepress';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function getDocuments() {
    const docsDir = path.resolve(__dirname, '..');
    const files = fs.readdirSync(docsDir);
    
    const docs = files
        .filter(file => file.endsWith('.md') && file !== 'index.md')
        .map(file => {
            const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
            const { data } = matter(content);
            const slug = file.replace('.md', '');
            
            return {
                text: data.title || slug,
                link: `/${slug}`,
                created: data.created || ''
            };
        })
        .sort((a, b) => b.created.localeCompare(a.created));
    
    return docs;
}

export default defineConfig({
    title: 'Archive',
    description: 'Personal knowledge base',
    
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' }
        ],
        
        sidebar: [
            {
                text: 'Documents',
                items: getDocuments()
            }
        ],
        
        socialLinks: [
            { icon: 'github', link: 'https://github.com/i2na/i2na/tree/main/archive' }
        ]
    }
});

