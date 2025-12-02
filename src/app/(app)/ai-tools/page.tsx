import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TitleGenerator from './title-generator';
import DescriptionGenerator from './description-generator';
import TagsGenerator from './tags-generator';
import ScriptGenerator from './script-generator';

export default function AIToolsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Content Tools</h1>
        <p className="text-muted-foreground">
          Generate high-quality content for your videos in seconds.
        </p>
      </div>
      <Tabs defaultValue="title" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="title">Title Generator</TabsTrigger>
          <TabsTrigger value="description">Description Generator</TabsTrigger>
          <TabsTrigger value="tags">Tags Generator</TabsTrigger>
          <TabsTrigger value="script">Script Outline</TabsTrigger>
        </TabsList>
        <TabsContent value="title">
          <Card>
            <CardHeader>
              <CardTitle>Title Generator</CardTitle>
              <CardDescription>
                Create catchy and SEO-friendly titles for your videos.
              </CardDescription>
            </CardHeader>
            <TitleGenerator />
          </Card>
        </TabsContent>
        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>Description Generator</CardTitle>
              <CardDescription>
                Craft compelling video descriptions that boost engagement.
              </CardDescription>
            </CardHeader>
            <DescriptionGenerator />
          </Card>
        </TabsContent>
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Tags Generator</CardTitle>
              <CardDescription>
                Find relevant and high-ranking tags for your video topic.
              </CardDescription>
            </CardHeader>
            <TagsGenerator />
          </Card>
        </TabsContent>
        <TabsContent value="script">
          <Card>
            <CardHeader>
              <CardTitle>Script Outline Generator</CardTitle>
              <CardDescription>
                Structure your next video with a detailed script outline.
              </CardDescription>
            </CardHeader>
            <ScriptGenerator />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
