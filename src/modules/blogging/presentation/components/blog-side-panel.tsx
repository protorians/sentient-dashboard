import {UserActivitiesFeed} from "@/modules/dashboard/presentation/components/user-activities-feed";
import {BlogAnalyticsData} from "@/modules/blogging/presentation/components/blog-analytics-data";

export function BlogSidePanel() {
    return (
        <div className="w-full lg:max-w-[25dvw]">
            <div className="flex flex-col gap-6">
                <BlogAnalyticsData/>
                <UserActivitiesFeed compacted={true}/>
            </div>
        </div>
    )
}
