import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const BUCKET_NAME = 'prescriptions';

/**
   * Upload a file to Supabase Storage
   * @param file - Express Multer file object
   * @param patientId - Patient ID for organizing files
   * @returns Object containing file path and public URL
   */
export const uploadFileToSupabase = async (
    file: Express.Multer.File,
    patientId: string
): Promise<{ path: string; url: string }> => {
    try {
        const timestamp = Date.now();
        const randomString = Math.round(Math.random() * 1E9);
        const fileExtension = file.originalname.split('.').pop();
        const fileName =
`prescription-${timestamp}-${randomString}.${fileExtension}`;

        const filePath = `${patientId}/${fileName}`;

        console.log('📤 Uploading file to Supabase:', filePath);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('❌ Supabase upload error:', error);
            throw new Error(`Failed to upload file: 
${error.message}`);
        }

        console.log('✅ File uploaded successfully:', data.path);

        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            path: data.path,
            url: urlData.publicUrl
        };
    } catch (error: any) {
        console.error('❌ Error in uploadFileToSupabase:',
error.message);
        throw error;
    }
};


/**
   * Delete a file from Supabase Storage
   * @param filePath - Path to file in storage
   * @returns Boolean indicating success
   */
export const deleteFileFromSupabase = async (filePath: string):
Promise<boolean> => {
    try {
        console.log('🗑️  Deleting file from Supabase:', filePath);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('❌ Supabase delete error:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }

        console.log('✅ File deleted successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Error in deleteFileFromSupabase:',
error.message);
        throw error;
    }
};